const getQuestions = require("./questionBank");
const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const db = require("./database");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(prompt) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });
    } catch (error) {
      const status = error.status;

      if (![429, 500, 503, 504].includes(status) ||
          attempt === maxAttempts) {
        throw error;
      }

      console.log(`Gemini unavailable. Retry ${attempt}/${maxAttempts}`);

      await sleep(1000 * Math.pow(2, attempt - 1));
    }
  }
}

// Generate a new interview

// Generate a new interview using local questions
router.post("/generate", (req, res) => {
  try {
    const { jobRole, experienceLevel, difficulty } = req.body;

    if (!jobRole || !experienceLevel || !difficulty) {
      return res.status(400).json({
        success: false,
        message: "Job role, experience level and difficulty are required.",
      });
    }

    // Get 8 random questions based on selected difficulty
    const questions = getQuestions(
      difficulty,
      jobRole,
      experienceLevel
    );

    if (!questions || questions.length !== 8) {
      throw new Error("Unable to retrieve interview questions.");
    }

    // Save interview session in SQLite
    const insertInterview = db.prepare(`
      INSERT INTO interviews (
        user_id,
        job_role,
        experience_level,
        difficulty,
        questions
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const savedInterview = insertInterview.run(
      req.user.id,
      jobRole,
      experienceLevel,
      difficulty,
      JSON.stringify(questions)
    );

    return res.status(201).json({
      success: true,
      message: "Practice interview created successfully.",
      interviewId: savedInterview.lastInsertRowid,
      questions,
      source: "local-question-bank",
    });

  } catch (error) {
    console.error("Interview generation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create interview.",
    });
  }
});


// Get a specific interview session
router.get("/:id", (req, res) => {
  try {
    const interviewId = Number(req.params.id);

    if (!Number.isInteger(interviewId) || interviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    const interview = db.prepare(`
      SELECT id, job_role, experience_level, difficulty,
             questions, status, created_at
      FROM interviews
      WHERE id = ? AND user_id = ?
    `).get(interviewId, req.user.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    const answers = db.prepare(`
      SELECT question_index, answer, feedback, score
      FROM interview_answers
      WHERE interview_id = ? AND user_id = ?
      ORDER BY question_index
    `).all(interviewId, req.user.id);

    return res.json({
      success: true,
      interview: {
        ...interview,
        questions: JSON.parse(interview.questions),
        answers,
      },
    });

  } catch (error) {
    console.error("Fetch interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve interview.",
    });
  }
});


// Submit an answer to an interview question
router.post("/:id/answer", (req, res) => {
  try {
    const interviewId = Number(req.params.id);
    const { questionIndex, answer } = req.body;

    if (
      !Number.isInteger(interviewId) ||
      interviewId <= 0 ||
      !Number.isInteger(questionIndex) ||
      typeof answer !== "string" ||
      !answer.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid interview ID, question index and answer are required.",
      });
    }

    if (answer.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Answer must be under 10,000 characters.",
      });
    }

    const interview = db.prepare(`
      SELECT id, questions
      FROM interviews
      WHERE id = ? AND user_id = ?
    `).get(interviewId, req.user.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    const questions = JSON.parse(interview.questions);

    if (
      questionIndex < 0 ||
      questionIndex >= questions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index.",
      });
    }

    db.prepare(`
      INSERT INTO interview_answers (
        interview_id,
        user_id,
        question_index,
        answer
      )
      VALUES (?, ?, ?, ?)
      ON CONFLICT(interview_id, question_index)
      DO UPDATE SET
        answer = excluded.answer,
        feedback = NULL,
        score = NULL
    `).run(
      interviewId,
      req.user.id,
      questionIndex,
      answer.trim()
    );

    return res.json({
      success: true,
      message: "Answer saved successfully.",
    });

  } catch (error) {
    console.error("Save answer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save answer.",
    });
  }
});

module.exports = router;
