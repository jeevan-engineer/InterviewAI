const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
const PORT = 8000;
app.get("/", (req, res) => {
  res.send("Welcome to InterviewAI Backend!");
});
app.get("/api/message", (req, res) => {
  res.json({
    success: true,
    message: "Hello from the InterviewAI Backend!"
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});