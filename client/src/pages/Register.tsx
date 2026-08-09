import API_BASE_URL from "../api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <h1 style={{ textAlign: "center" }}>Create Account</h1>
        <form onSubmit={handleRegister}>
        <input
  type="text"
  placeholder="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginTop: "20px",
    marginBottom: "15px",
  }}
/>

        <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
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
    marginBottom: "15px",
  }}
/>

        <input
  type="password"
  placeholder="Confirm Password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "20px",
  }}
/>
        
        <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
        </button>
{success && (
  <p style={{ color: "green", marginTop: "15px" }}>
    {success}
  </p>
)}

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

export default Register;