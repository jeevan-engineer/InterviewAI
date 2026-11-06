import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../api";

interface Question {
  question: string;
  category?: string;
}

interface SavedAnswer {
  question_index: number;
  answer: string;
  feedback?: string | null;
  score?: number | null;
}

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<SavedAnswer[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const started = useRef(false);     
  useEffect(() => {
    if (started.current) return;                        // CHANGE 3: new line, first thing in useEffect
    started.current = true;  
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

        fetch(`${API_BASE_URL}/api/interview/${id}/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .catch(() => null)
      .then(() =>
        fetch(`${API_BASE_URL}/api/interview/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load results.");

        const interview = data.interview ?? data;
        const rawQuestions = interview.questions;
        const parsed =
          typeof rawQuestions === "string"
            ? JSON.parse(rawQuestions)
            : rawQuestions || [];

        setMeta(interview);
        setQuestions(parsed);
        setAnswers(data.answers ?? interview.answers ?? []);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Something went wrong.")
      )
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading)
  return (
    <p style={{ textAlign: "center", marginTop: "60px" }}>
      Evaluating your answers with AI... this can take up to 20 seconds.
    </p>
  );
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const answered = answers.filter((a) => a.answer && a.answer.trim()).length;
  const totalScore = answers.reduce((sum, a) => sum + (a.score ?? 0), 0);
  return (
    <div>
      <h1>Interview Summary</h1>
      {meta && (
        <p>
          {meta.job_role ?? meta.jobRole} · {meta.experience_level ?? meta.experienceLevel} ·{" "}
          {meta.difficulty}
        </p>
      )}
      <p>
        Answered {answered} of {questions.length} questions.
      </p>
            <h2>
        Overall Score: {totalScore} / {questions.length * 10}
      </h2>

      {questions.map((q, index) => {
        const saved = answers.find((a) => a.question_index === index);
        return (
          <div
            key={index}
            style={{
              padding: "18px",
              marginBottom: "15px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <strong>Question {index + 1}</strong>
            <p>{q.question}</p>
            <p>
              <em>Your answer:</em>{" "}
              {saved?.answer?.trim() ? saved.answer : "Not answered"}
            </p>
            {saved?.feedback && <p>Feedback: {saved.feedback}</p>}
            {saved?.score != null && <p>Score: {saved.score}/10</p>}
          </div>
        );
      })}

      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>{" "}
      <button onClick={() => navigate("/interview-setup")}>
        Start Another Interview
      </button>
    </div>
  );
};

export default Result;