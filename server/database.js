const { createClient } = require("@libsql/client");

// Uses Turso when TURSO_DATABASE_URL is set, otherwise the local file
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:interviewai.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Turn the client's result into plain objects, like better-sqlite3 did
function toPlain(result) {
  return result.rows.map((row) =>
    Object.fromEntries(result.columns.map((col, i) => [col, row[i]]))
  );
}

const db = {
  prepare(sql) {
    return {
      async get(...args) {
        const result = await client.execute({ sql, args });
        return toPlain(result)[0];
      },
      async all(...args) {
        const result = await client.execute({ sql, args });
        return toPlain(result);
      },
      async run(...args) {
        const result = await client.execute({ sql, args });
        return {
          changes: result.rowsAffected,
          lastInsertRowid: Number(result.lastInsertRowid),
        };
      },
    };
  },
};

// Create tables once at startup. index.js waits for this before listening.
db.ready = (async () => {
  try {
    await client.execute("PRAGMA foreign_keys = ON");
  } catch (err) {
    console.log("Could not enable foreign keys:", err.message);
  }

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resumes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      extracted_text TEXT NOT NULL,
      parsed_profile TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      job_role TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      questions TEXT NOT NULL,
      status TEXT DEFAULT 'created',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS interview_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interview_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      answer TEXT NOT NULL,
      feedback TEXT,
      score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(interview_id, question_index)
    );
  `);

  console.log("Database connected. Tables ready.");
})();

module.exports = db;