import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HospitalSearchPage from "./pages/HospitalSearchPage";
import QueuePage from "./pages/QueuePage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HospitalSearchPage />} />
      <Route path="/hospital/:hospitalId/queue/:queueId" element={<QueuePage />} />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

