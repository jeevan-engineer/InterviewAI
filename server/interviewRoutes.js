const getQuestions = require("./questionBank");
const express = require("express");
const { evaluateAnswer } = require("./evaluator");
const { GoogleGenAI } = require("@google/genai");
const db = require("./database");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const GEMINI_MODELS = (
  process.env.GEMINI_MODELS ||
  "gemini-3.1-flash-lite,gemini-flash-lite-latest,gemini-3.5-flash-lite"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            Object.assign(new Error("Gemini request timed out"), {
              status: 408,
            })
          ),
        ms
      )
    ),
  ]);

async function generateWithRetry(prompt) {
  const deadline = Date.now() + 25000;
  let lastError;

  for (const model of GEMINI_MODELS) {
    const remaining = deadline - Date.now();
    if (remaining < 3000) break;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
        Math.min(8000, remaining)
      );
      console.log("Gemini model used:", model);
      return response;
    } catch (error) {
      lastError = error;
      console.log(`Gemini ${model} failed (${error.status || error.message})`);

      // Stop completely on errors like a bad key
      if (![400, 404, 408, 429, 500, 503, 504].includes(error.status)) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Gemini unavailable");
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
// Evaluate several answers with ONE Gemini call
async function evaluateWithGemini(questions, pending) {
  const items = pending.map((p) => ({
    index: p.question_index,
    category: questions[p.question_index]?.category,
    question: questions[p.question_index]?.question,
    answer: p.answer,
  }));

  const prompt = `You are a strict but encouraging technical interviewer. Evaluate each candidate answer below.
For each item return an integer score from 0 to 10 and short, specific feedback (max 2 sentences) saying what was good and what to improve.
Return ONLY a JSON array like [{"index": 0, "score": 7, "feedback": "..."}] with one object per item.

${JSON.stringify(items)}`;

  const response = await generateWithRetry(prompt);
  const parsed = JSON.parse(response.text);

  const results = {};
  for (const r of parsed) {
    if (
      Number.isInteger(r.index) &&
      Number.isFinite(r.score) &&
      typeof r.feedback === "string"
    ) {
      results[r.index] = {
        score: Math.max(0, Math.min(10, Math.round(r.score))),
        feedback: r.feedback.trim(),
      };
    }
  }
  return results;
}
// Evaluate all saved answers of an interview
router.post("/:id/evaluate", async (req, res) => {
  try {
    const interviewId = Number(req.params.id);

    if (!Number.isInteger(interviewId) || interviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
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

    // Only answers that have not been scored yet
    const pending = db.prepare(`
      SELECT question_index, answer
      FROM interview_answers
      WHERE interview_id = ? AND user_id = ? AND score IS NULL
    `).all(interviewId, req.user.id);

    let source = "cached";

    if (pending.length > 0) {
      let results = {};
      source = "gemini";

      try {
        results = await evaluateWithGemini(questions, pending);
      } catch (err) {
        console.log("Gemini evaluation failed, using fallback:", err.message);
      console.log("Cause:", err.cause?.code || err.cause?.message || err.cause);
        source = "fallback";
      }

      const updateStmt = db.prepare(`
        UPDATE interview_answers
        SET score = ?, feedback = ?
        WHERE interview_id = ? AND user_id = ? AND question_index = ?
      `);

      for (const item of pending) {
        const result =
          results[item.question_index] ||
          evaluateAnswer(questions[item.question_index], item.answer);

        updateStmt.run(
          result.score,
          result.feedback,
          interviewId,
          req.user.id,
          item.question_index
        );
      }
    }

    console.log("Evaluation source:", source);

    const row = db.prepare(`
      SELECT COALESCE(SUM(score), 0) AS total
      FROM interview_answers
      WHERE interview_id = ? AND user_id = ?
    `).get(interviewId, req.user.id);

    db.prepare(`
      UPDATE interviews SET status = 'completed'
      WHERE id = ? AND user_id = ?
    `).run(interviewId, req.user.id);

    return res.json({
      success: true,
      totalScore: row.total,
      maxScore: questions.length * 10,
      source,
    });

  } catch (error) {
    console.error("Evaluate interview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to evaluate interview.",
    });
  }
});
module.exports = router;
