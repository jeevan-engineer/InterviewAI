import API_BASE_URL from "../api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}
function Login() {
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const navigate = useNavigate();
  const handleLogin = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  e.preventDefault();

  setError("");

  if (!email || !password) {
    setError("Email and password are required.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/login`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }
    localStorage.setItem("token", data.token);
    navigate("/dashboard");
  } catch (err) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Something went wrong.");
    }
  } finally {
    setLoading(false);
  }
};

    return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">🎯 InterviewAI</div>
        <p className="muted auth-sub">Sign in to continue your interview prep</p>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <label className="checkbox-label field">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            Show password
          </label>

          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;