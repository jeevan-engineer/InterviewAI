import API_BASE_URL from "../api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
const REDIRECT_DELAY = 2000;


interface RegisterResponse {
  message: string;
}
function Register() {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const navigate = useNavigate();
  const handleRegister = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  e.preventDefault();
  setError("");
  setSuccess("");

// Frontend validation
if (password !== confirmPassword) {
  setError("Passwords do not match.");
  return;
}

setLoading(true);
  

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data: RegisterResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    setSuccess(data.message);

    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => {
  navigate("/");
}, REDIRECT_DELAY);
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
        <p className="muted auth-sub">Create your account</p>

        <form onSubmit={handleRegister}>
          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Registering..." : "Register"}
          </button>

          {success && <p className="success-text">{success}</p>}
          {error && <p className="error-text">{error}</p>}
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;