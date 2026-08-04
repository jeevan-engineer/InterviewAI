import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const isLoggedIn =
  localStorage.getItem("isLoggedIn") === "true";

  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;