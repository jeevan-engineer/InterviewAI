import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
const Dashboard = () => {
  const navigate = useNavigate();
  console.log("Dashboard Rendered");

  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const handleLogout = (): void => {
  localStorage.removeItem("token");

  navigate("/", { replace: true });
};
  useEffect(() => {
  console.log("useEffect Ran");

  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/", { replace: true });
    return;
  }
console.log("Loading started");
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
  return;
}

if (!response.ok) {
  throw new Error("Failed to fetch profile");
}

      return response.json();
    })
   .then((data) => {
  console.log("Profile data:", data);
  setUser(data.user);
  setLoading(false);
})
.catch((error) => {
  console.error("Profile error:", error);
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
      <h2>{message}</h2>

      <h3>Count: {count}</h3>

      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>
      <button
  onClick={handleLogout}
  style={{
    marginLeft: "10px",
  }}
>
  Logout
</button>
    </div>
  );
};

export default Dashboard;