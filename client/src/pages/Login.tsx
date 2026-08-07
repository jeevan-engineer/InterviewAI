import API_BASE_URL from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
}
function Login() {
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

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
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f4f4",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "10px",
          width: "350px",
          boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ textAlign: "center" }}>InterviewAI</h1>
        <form onSubmit={handleLogin}>
        <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginTop: "20px",
    marginBottom: "15px",
  }}
/>

<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
  }}
/>

        <button
  type="submit"
  disabled={loading}
  style={{
    width: "100%",
    padding: "10px",
    cursor: loading ? "not-allowed" : "pointer",
  }}
>
  {loading ? "Logging in..." : "Login"}
</button>
{error && (
  <p style={{ color: "red", marginTop: "15px" }}>
    {error}
  </p>
)}
         
</form>
      </div>
    </div>
  );
}

export default Login;