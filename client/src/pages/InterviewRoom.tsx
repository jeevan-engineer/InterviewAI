import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../api";

interface Question {
  question: string;
  category: string;
}

interface Interview {
  id: number;
  job_role: string;
  questions: Question[];
  answers: {
    question_index: number;
    answer: string;
  }[];
}

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadInterview = async () => {
      try {
        if (!token) {
          navigate("/", { replace: true });
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/interview/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load interview.");
        }

        setInterview(data.interview);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInterview();
  }, [id, navigate, token]);

  useEffect(() => {
    if (!interview) return;

    const savedAnswer = interview.answers.find(
      (item) => item.question_index === currentIndex
    );

    setAnswer(savedAnswer?.answer || "");
  }, [interview, currentIndex]);

  const saveAnswer = async () => {
    if (!answer.trim()) {
      setError("Please enter your answer before continuing.");
      return false;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/interview/${id}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            questionIndex: currentIndex,
            answer,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save answer.");
      }

      setInterview((previous) => {
        if (!previous) return previous;

        const existing = previous.answers.filter(
          (item) => item.question_index !== currentIndex
        );

        return {
          ...previous,
          answers: [
            ...existing,
            {
              question_index: currentIndex,
              answer,
            },
          ],
        };
      });

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save answer."
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (await saveAnswer()) {
      if (interview && currentIndex < interview.questions.length - 1) {
        setCurrentIndex((previous) => previous + 1);
      }
    }
  };

  const handlePrevious = () => {
    setError("");
    setCurrentIndex((previous) => Math.max(0, previous - 1));
  };

  const handleFinish = async () => {
    if (await saveAnswer()) {
      navigate(`/interview/${id}/result`);
    }
  };

  if (loading) return <p>Loading interview...</p>;

  if (error && !interview) {
    return <p className="error-text">{error}</p>;
  }

  if (!interview) return <p>Interview not found.</p>;

  const question = interview.questions[currentIndex];
  const progress = ((currentIndex + 1) / interview.questions.length) * 100;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <button
        className="btn-secondary"
        style={{ marginBottom: "16px" }}
        onClick={() => navigate("/dashboard")}
      >
        ← Exit Interview
      </button>

      <h1>Mock Interview</h1>
      <p className="muted">{interview.job_role}</p>

      <div style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>
            Question {currentIndex + 1} of {interview.questions.length}
          </strong>
          <span className="muted">{Math.round(progress)}% completed</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <span className="tag">{question.category}</span>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "16px" }}>
          {question.question}
        </h2>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Write your answer here..."
          rows={9}
        />
        <small>
          {answer.trim().split(/\s+/).filter(Boolean).length} words. Aim for 50 to 100.
        </small>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="room-nav">
        <button
          className="btn-secondary"
          onClick={handlePrevious}
          disabled={currentIndex === 0 || saving}
        >
          ← Previous
        </button>

        {currentIndex === interview.questions.length - 1 ? (
          <button onClick={handleFinish} disabled={saving}>
            {saving ? "Saving..." : "Finish Interview"}
          </button>
        ) : (
          <button onClick={handleNext} disabled={saving}>
            {saving ? "Saving..." : "Save & Next →"}
          </button>
        )}
      </div>
    </div>
  );
};

export default InterviewRoom;