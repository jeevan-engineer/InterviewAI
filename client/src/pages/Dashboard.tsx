
import { useEffect, useState } from "react";
import ResumeAnalyzer from "../components/ResumeAnalyzer";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

const Dashboard = () => {
  const navigate = useNavigate();

 
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companyInput, setCompanyInput] = useState("");

  
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
      <div className="hero">
        {loading ? (
          <h1>Loading...</h1>
        ) : (
          <>
            <h1>Welcome{user ? `, ${user.name}` : ""} 👋</h1>
            {user && <p className="muted">{user.email}</p>}
          </>
        )}
      </div>

      <ResumeAnalyzer />

      <div className="grid-2">
        <div className="card">
          <h2>🏢 Prepare for a Company</h2>
          <p className="muted">
            Enter the company you're interviewing with and get practice
            questions in its style.
          </p>
          <div className="row">
            <input
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              placeholder="e.g. Google, TCS, Zoho"
              maxLength={60}
              style={{ flex: 1, minWidth: "180px" }}
            />
            <button
              onClick={() =>
                navigate("/interview-setup", { state: { company: companyInput } })
              }
            >
              Continue →
            </button>
          </div>
        </div>

        <div className="card">
          <h2>🎤 Quick Mock Interview</h2>
          <p className="muted">
            Pick a role, level and difficulty, then practise answering one
            question at a time.
          </p>
          <button onClick={() => navigate("/interview-setup")}>
            Start Mock Interview →
          </button>
        </div>
      </div>
    </div>
  );
   
};

export default Dashboard;
