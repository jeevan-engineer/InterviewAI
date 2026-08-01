import { useEffect, useState } from "react";

const Dashboard = () => {
  console.log("Dashboard Rendered");

  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);

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
    </div>
  );
};

export default Dashboard;