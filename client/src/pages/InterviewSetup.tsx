
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

interface Question {
  question: string;
  category: string;
}

const InterviewSetup = () => {
  const navigate = useNavigate();

  const [jobRole, setJobRole] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Intermediate");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/interview/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jobRole,
            experienceLevel,
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate interview.");
      }

      setQuestions(data.questions);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "850px", margin: "40px auto", padding: "20px" }}>
      <button onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <h1>Prepare for Your Interview</h1>
      <p>Customize your mock interview and let AI prepare your questions.</p>

      <form onSubmit={handleGenerate}>
        <div style={{ marginBottom: "20px" }}>
          <label>Job Role</label>
          <select
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            style={{ display: "block", width: "100%", padding: "12px" }}
          >
            <option>Full Stack Developer</option>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Software Engineer</option>
            <option>Java Developer</option>
            <option>Python Developer</option>
            <option>Data Analyst</option>
            <option>Machine Learning Engineer</option>
            <option>DevOps Engineer</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Experience Level</label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            style={{ display: "block", width: "100%", padding: "12px" }}
          >
            <option>Fresher</option>
            <option>0-1 Years</option>
            <option>1-3 Years</option>
            <option>3-5 Years</option>
            <option>5+ Years</option>
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Interview Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{ display: "block", width: "100%", padding: "12px" }}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generating Questions..." : "Generate Interview"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>{error}</p>
      )}

      {questions.length > 0 && (
        <div style={{ marginTop: "35px" }}>
          <h2>Your AI-Generated Interview Questions</h2>
          <p>{questions.length} questions generated successfully.</p>

          {questions.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "18px",
                marginBottom: "15px",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <strong>Question {index + 1}</strong>
              <p>{item.question}</p>
              <small>{item.category}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewSetup;
