import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { getStored, initialComplaints } from "./data.js";
import Dashboard from "./pages/Dashboard.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import WriteComplaint from "./pages/WriteComplaint.jsx";
import AppShell from "./assets/AppShell.jsx";
import AndroidApp from "./android/AndroidApp.jsx";

function App() {
  const { pathname } = useLocation();
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 720px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const onChange = (event) => setIsMobile(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  if (pathname === "/android" || pathname.startsWith("/android/")) {
    return <AndroidApp />;
  }

  if (isMobile) {
    const mobileRoutes = {
      "/dashboard": "/android/student/dashboard",
      "/write": "/android/student/write",
      "/history": "/android/student/history",
      "/profile": "/android/student/profile",
    };
    return <Navigate to={mobileRoutes[pathname] || "/android"} replace />;
  }

  return <WebApp />;
}

function WebApp() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState(() => getStored("studentVoiceComplaints", initialComplaints));
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("studentVoiceComplaints", JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const addComplaint = (complaint) => {
    setComplaints((current) => [complaint, ...current]);
    navigate("/history");
    setToast("Your complaint has been submitted.");
  };

  return (
    <AppShell selectedComplaint={selectedComplaint} onCloseComplaint={() => setSelectedComplaint(null)} toast={toast} onToast={setToast}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard complaints={complaints} onNavigate={(next) => navigate(`/${next}`)} onSelect={setSelectedComplaint} />} />
        <Route path="/write" element={<WriteComplaint onSubmit={addComplaint} onCancel={() => navigate("/dashboard")} onToast={setToast} />} />
        <Route path="/history" element={<History complaints={complaints} onNavigate={(next) => navigate(`/${next}`)} onSelect={setSelectedComplaint} />} />
        <Route path="/profile" element={<Profile onToast={setToast} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}

export default App;
