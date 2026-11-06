
import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../api";

interface Question {
  question: string;
  category: string;
}

const InterviewSetup = () => {
  const navigate = useNavigate();
    const location = useLocation();

  const [jobRole, setJobRole] = useState("Full Stack Developer");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("medium");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [useResume, setUseResume] = useState(false);
  const [company, setCompany] = useState(
    (location.state as { company?: string } | null)?.company ?? ""
  );

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
            useResume,
            company,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate interview.");
      }

            if ((company.trim() || useResume) && data.source === "local-question-bank") {
        alert("Gemini was busy, so general practice questions were used instead.");
      }
      navigate(`/interview/${data.interviewId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="card" style={{ maxWidth: "760px", margin: "0 auto" }}>
            <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
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
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label>
                    <div style={{ marginBottom: "20px" }}>
          <label>Target Company (optional)</label>
          <input
            list="company-list"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, TCS, Zoho or any company"
            maxLength={60}
            style={{ display: "block", width: "100%", padding: "12px" }}
          />
          <datalist id="company-list">
            <option value="Google" />
            <option value="Microsoft" />
            <option value="Amazon" />
            <option value="TCS" />
            <option value="Infosys" />
            <option value="Wipro" />
            <option value="Accenture" />
            <option value="Cognizant" />
            <option value="Capgemini" />
            <option value="Flipkart" />
            <option value="Zoho" />
          </datalist>
          <small>
            Questions are AI-generated practice questions in the style the company is
            known for, not real leaked questions.
          </small>
        </div>
            
          </label>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label>
            <input
              type="checkbox"
              checked={useResume}
              onChange={(e) => setUseResume(e.target.checked)}
            />{" "}
            Base questions on my resume
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Generating Questions..." : "Generate Interview"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "20px" }}>{error}</p>
      )}

      
        </div>
      )}
   

export default InterviewSetup;
