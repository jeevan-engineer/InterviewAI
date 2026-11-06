require("dotenv").config();

const db = require("./database");
const authMiddleware = require("./middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const interviewRoutes = require("./interviewRoutes");
const resumeRoutes = require("./resumeRoutes");
const cors = require("cors");
const app = express();
app.use(express.json());
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());
app.use(cors({ origin: allowedOrigins }));
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set.");
  process.exit(1);
}
app.get("/", (req, res) => {
  res.send("Welcome to InterviewAI Backend!");
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/message", (req, res) => {
  res.json({
    success: true,
    message: "Hello from the InterviewAI Backend!"
  });
});
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `);

    const hashedPassword = bcrypt.hashSync(password, 10);

    await insertUser.run(name, email, hashedPassword);
    res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  } catch (error) {
        if (
      String(error.code).startsWith("SQLITE_CONSTRAINT") ||
      /UNIQUE/i.test(error.message)
    ) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered.",
      });
    }

    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

app.post("/login", async(req, res) => {
  const { email, password } = req.body;

  // Check if both fields are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    // Find user by email
    const user = await db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    // Check if user exists or password is incorrect
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Successful login
    res.status(200).json({
      success: true,
      message: "Login successful.",
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await db
      .prepare("SELECT id, name, email, created_at FROM users WHERE id = ?")
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Welcome to your profile.",
      user: user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});
// Protected resume APIs
app.use("/api/resume", authMiddleware, resumeRoutes);
app.use("/api/interview", authMiddleware, interviewRoutes);
// Handle upload and other middleware errors
app.use((err, req, res, next) => {
  console.error("API error:", err.message);

  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Resume must be smaller than 5 MB."
          : "File upload failed.",
    });
  }

  if (err.message === "Only PDF files are allowed.") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});
db.ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database setup failed:", err);
    process.exit(1);
  });