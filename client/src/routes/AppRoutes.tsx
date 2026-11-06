
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

import InterviewSetup from "../pages/InterviewSetup";
import InterviewRoom from "../pages/InterviewRoom";
import Result from "../pages/Result";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/interview-setup"
              element={<InterviewSetup />}
            />
            <Route
              path="/interview/:id"
              element={<InterviewRoom />}
            />
          </Route>
          <Route path="/interview/:id/result" element={<Result />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
