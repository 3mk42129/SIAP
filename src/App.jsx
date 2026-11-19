import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import { useApp } from "./lib/store.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Profile from "./pages/Profile.jsx";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import History from "./pages/student/History.jsx";
import WriteComplaint from "./pages/student/WriteComplaint.jsx";
import StaffComplaint from "./pages/staff/StaffComplaint.jsx";
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import StaffInsights from "./pages/staff/StaffInsights.jsx";
import StaffQueue from "./pages/staff/StaffQueue.jsx";

const homeFor = (user) => (user.role === "staff" ? "/staff" : "/dashboard");

function RequireRole({ role, children }) {
  const { user, signedOut } = useApp();
  const location = useLocation();
  // After a deliberate sign-out, don't send the next person back to the previous user's page.
  if (!user) return <Navigate to="/login" replace state={signedOut ? null : { from: location.pathname + location.search }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user)} replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  const { user } = useApp();
  return <Routes>
    <Route path="/login" element={user ? <Navigate to={homeFor(user)} replace /> : <Login />} />
    <Route path="/register" element={user ? <Navigate to={homeFor(user)} replace /> : <Register />} />

    <Route path="/dashboard" element={<RequireRole role="student"><StudentDashboard /></RequireRole>} />
    <Route path="/write" element={<RequireRole role="student"><WriteComplaint /></RequireRole>} />
    <Route path="/history" element={<RequireRole role="student"><History /></RequireRole>} />

    <Route path="/staff" element={<RequireRole role="staff"><StaffDashboard /></RequireRole>} />
    <Route path="/staff/queue" element={<RequireRole role="staff"><StaffQueue /></RequireRole>} />
    <Route path="/staff/complaints/:id" element={<RequireRole role="staff"><StaffComplaint /></RequireRole>} />
    <Route path="/staff/insights" element={<RequireRole role="staff"><StaffInsights /></RequireRole>} />

    <Route path="/profile" element={<RequireRole><Profile /></RequireRole>} />
    <Route path="*" element={<Navigate to={user ? homeFor(user) : "/login"} replace />} />
  </Routes>;
}
