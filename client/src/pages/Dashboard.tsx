
import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resumeStatus, setResumeStatus] = useState("");

  // Logout
  const handleLogout = (): void => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };
  const handleResumeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("resume", file);

    setResumeStatus("Uploading and analyzing resume...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed.");
      setResumeStatus(
        `Resume analyzed. Found ${data.profile?.skills?.length ?? 0} skills.`
      );
    } catch (err) {
      setResumeStatus(err instanceof Error ? err.message : "Upload failed.");
    }
  };
  // Fetch logged-in user profile
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("Profile response status:", response.status);

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/", { replace: true });
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Profile data:", data);
        setUser(data.user);
      })
      .catch((error) => {
        console.error("Profile error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        user && (
          <div>
            <h2>Welcome, {user.name} 👋</h2>
            <p>Email: {user.email}</p>
          </div>
        )
      )}
            <div style={{ marginTop: "20px" }}>
        <h3>Your Resume (PDF)</h3>
        <input type="file" accept="application/pdf" onChange={handleResumeUpload} />
        <p>{resumeStatus}</p>
      </div>
      {/* Start Mock Interview */}
      <button
        onClick={() => {
          console.log("Start Interview button clicked");
          navigate("/interview-setup");
        }}
        style={{
          padding: "12px 24px",
          marginTop: "20px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Start Mock Interview →
      </button>

      <h2>{message}</h2>

      <h3>Count: {count}</h3>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{ marginLeft: "10px" }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
