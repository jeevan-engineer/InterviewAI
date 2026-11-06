const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

async function generateWithRetry(
  prompt,
  { temperature = 0.7, totalMs = 25000, perModelMs = 8000 } = {}
) {
  const deadline = Date.now() + totalMs;
  let lastError;

  for (const model of GEMINI_MODELS) {
    const remaining = deadline - Date.now();
    if (remaining < 3000) break;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json", temperature },
        }),
        Math.min(perModelMs, remaining)
      );
      console.log("Gemini model used:", model);
      return response;
    } catch (error) {
      lastError = error;
      console.log(`Gemini ${model} failed (${error.status || error.message})`);

      if (![400, 404, 408, 429, 500, 503, 504].includes(error.status)) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Gemini unavailable");
}

module.exports = { generateWithRetry };