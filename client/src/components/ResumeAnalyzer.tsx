import { useEffect, useState, type ChangeEvent } from "react";
import API_BASE_URL from "../api";

interface Profile {
  summary?: string;
  skills?: string[];
  strengths?: string[];
  improvementAreas?: string[];
  atsScore?: number | null;
  atsIssues?: string[];
}

const scoreColor = (s: number) =>
  s >= 75 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626";

const cardStyle = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "20px",
};

const ResumeAnalyzer = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filename, setFilename] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Load the latest analyzed resume, if any
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/resume/latest`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setProfile(data.resume.profile);
        setFilename(data.resume.filename);
      })
      .catch(() => null);
  }, []);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setStatus("Analyzing your resume with AI... this can take up to 40 seconds.");

    try {
      const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed.");

      setProfile(data.profile);
      setFilename(file.name);
      setStatus("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const score = profile?.atsScore;

  return (
    <div
      style={{
        ...cardStyle,
        border: "2px solid #2563eb",
        background: "#f8faff",
        marginBottom: "30px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>📄 Upload & Analyze Your Resume</h2>
      <p style={{ color: "#4b5563" }}>
        Get an AI summary, your strengths, what to fix and an ATS score.
      </p>

      <label
        style={{
          display: "inline-block",
          padding: "12px 22px",
          background: loading ? "#93c5fd" : "#2563eb",
          color: "white",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Analyzing..." : profile ? "Upload a new resume" : "Choose PDF resume"}
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          disabled={loading}
          style={{ display: "none" }}
        />
      </label>

      {filename && !loading && (
        <span style={{ marginLeft: "12px", color: "#4b5563" }}>
          Current: {filename}
        </span>
      )}

      {status && <p style={{ marginTop: "15px" }}>{status}</p>}

      {profile && !loading && (
        <div style={{ marginTop: "25px" }}>
          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                ...cardStyle,
                textAlign: "center",
                minWidth: "160px",
              }}
            >
              <div style={{ color: "#6b7280" }}>ATS Score</div>
              {typeof score === "number" ? (
                <div
                  style={{
                    fontSize: "52px",
                    fontWeight: 700,
                    color: scoreColor(score),
                  }}
                >
                  {score}
                  <span style={{ fontSize: "20px", color: "#6b7280" }}>/100</span>
                </div>
              ) : (
                <p style={{ fontSize: "14px" }}>
                  Re-upload your resume to get an ATS score.
                </p>
              )}
            </div>

            <div style={{ ...cardStyle, flex: 1, minWidth: "260px" }}>
              <strong>Summary</strong>
              <p style={{ marginBottom: 0 }}>{profile.summary || "No summary available."}</p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            <div style={{ ...cardStyle, borderTop: "4px solid #16a34a" }}>
              <strong>✅ What's good</strong>
              <ul>
                {(profile.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div style={{ ...cardStyle, borderTop: "4px solid #dc2626" }}>
              <strong>⚠️ What to improve</strong>
              <ul>
                {(profile.improvementAreas || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {profile.atsIssues && profile.atsIssues.length > 0 && (
            <div style={{ ...cardStyle, marginTop: "20px", borderTop: "4px solid #d97706" }}>
              <strong>🤖 How to improve your ATS score</strong>
              <ul>
                {profile.atsIssues.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {profile.skills && profile.skills.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <strong>Detected skills</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {profile.skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      background: "#e0e7ff",
                      color: "#3730a3",
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "14px",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;