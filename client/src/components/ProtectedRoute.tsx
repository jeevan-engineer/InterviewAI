import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const isLoggedIn = true; // We'll replace this later

  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
}

export default ProtectedRoute;