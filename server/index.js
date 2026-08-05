const authMiddleware = require("./middleware/authMiddleware");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const PORT = 8000;
const JWT_SECRET = "InterviewAISecret123";
app.get("/", (req, res) => {
  res.send("Welcome to InterviewAI Backend!");
});
app.get("/api/message", (req, res) => {
  res.json({
    success: true,
    message: "Hello from the InterviewAI Backend!"
  });
});
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(418).json({
            success: false,
            message: "All fields are required.",
        });
    }

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

    res.status(201).json({
        success: true,
        message: "User registered successfully.",
    });
});
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Check if both fields are provided
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required.",
        });
    }

    // Simulated user credentials
    const storedEmail = "jeevan@gmail.com";
    const storedPassword = "123456";

    // Validate credentials
    if (email !== storedEmail || password !== storedPassword) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password.",
        });
    }
const token = jwt.sign(
    {
        email: storedEmail,
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
});
app.get("/profile",authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to your profile.",
        user: req.user,
    });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});