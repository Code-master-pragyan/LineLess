import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HospitalSearchPage from "./pages/HospitalSearchPage";
import QueuePage from "./pages/QueuePage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import Footer from "./components/Footer";

/* ── Layout wrapper — renders around every route ── */
function Layout({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Page content grows to fill available space */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <HospitalSearchPage />
          </Layout>
        }
      />
      <Route
        path="/hospital/:hospitalId/queue/:queueId"
        element={
          <Layout>
            <QueuePage />
          </Layout>
        }
      />
      <Route
        path="/admin/login"
        element={
          <Layout>
            <AdminLoginPage />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <AdminDashboardPage />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

