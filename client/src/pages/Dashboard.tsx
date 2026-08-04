import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  console.log("Dashboard Rendered");

  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
const handleLogout = (): void => {
  localStorage.removeItem("isLoggedIn");

  navigate("/", { replace: true });
};
  useEffect(() => {
    console.log("useEffect Ran");

    fetch("http://localhost:8000/api/message")
      .then((response) => response.json())
      .then((data) => {
        console.log("Backend Called");
        setMessage(data.message);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>

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