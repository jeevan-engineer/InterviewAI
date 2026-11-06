const CATEGORY_KEYWORDS = {
  "System Design": ["scalable", "load balancer", "cache", "database", "microservice", "queue", "latency", "horizontal", "api", "replication"],
  "Problem Solving": ["debug", "logs", "reproduce", "root cause", "test", "isolate", "fix", "steps", "monitor"],
  Database: ["index", "normalize", "schema", "primary key", "foreign key", "query", "relationship", "transaction", "table"],
  Performance: ["profile", "cache", "optimize", "bottleneck", "latency", "index", "lazy", "memory", "metrics"],
  Security: ["authentication", "authorization", "encrypt", "hash", "token", "validation", "https", "injection", "sanitize"],
  Technical: ["example", "performance", "design", "api", "code", "framework", "test"],
  HR: ["team", "learned", "challenge", "result", "goal", "communication", "responsibility"],
};

const STRUCTURE_WORDS = ["because", "for example", "for instance", "first", "then", "finally", "trade-off", "tradeoff", "result"];

function evaluateAnswer(question, answer) {
  const text = (answer || "").trim().toLowerCase();

  if (!text) {
    return { score: 0, feedback: "No answer was provided for this question." };
  }

  const words = text.split(/\s+/).length;
  const keywords = CATEGORY_KEYWORDS[question?.category] || CATEGORY_KEYWORDS.Technical;

  // Length: up to 4 points (about 80 words = full marks)
  const lengthScore = Math.min(4, (words / 80) * 4);

  // Keywords: up to 4 points (4 matched keywords = full marks)
  const matched = keywords.filter((k) => text.includes(k));
  const keywordScore = Math.min(4, matched.length);

  // Structure: up to 2 points
  const structureHits = STRUCTURE_WORDS.filter((w) => text.includes(w)).length;
  const structureScore = Math.min(2, structureHits);

  const score = Math.round(Math.min(10, lengthScore + keywordScore + structureScore));

  const tips = [];
  if (words < 40) tips.push("Your answer is short. Aim for 50 to 100 words with more detail.");
  if (matched.length < 2) tips.push("Mention more relevant technical concepts for this topic.");
  if (structureHits === 0) tips.push("Structure your answer and back it up with a real example.");

  const feedback = tips.length
    ? tips.join(" ")
    : "Good answer: well detailed, relevant and structured.";

  return { score, feedback };
}

module.exports = { evaluateAnswer };