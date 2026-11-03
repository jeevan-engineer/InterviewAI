
const Database = require("better-sqlite3");

const db = new Database("interviewai.db");

db.pragma("foreign_keys = ON");

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    extracted_text TEXT NOT NULL,
    parsed_profile TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`).run();
db.prepare(`
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
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS interview_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    question_index INTEGER NOT NULL,
    answer TEXT NOT NULL,
    feedback TEXT,
    score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (interview_id)
      REFERENCES interviews(id) ON DELETE CASCADE,

    FOREIGN KEY (user_id)
      REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE(interview_id, question_index)
  )
`).run();

console.log("Database connected. Users and resumes tables ready.");

module.exports = db;
