import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import QRCodeCard from "../components/QRCodeCard";

export default function HospitalSearchPage() {
  const [search, setSearch] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [queues, setQueues] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingQueues, setLoadingQueues] = useState(false);
  const [error, setError] = useState(null);

  // --- Notification Popup State ---
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Delay the popup slightly so it doesn't overwhelm the user immediately on load
  useEffect(() => {
    const timer = setTimeout(() => {
      // You can also check localStorage here to see if they previously dismissed it
      setShowNotificationPopup(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    
    // Request Browser Notification Permission
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
      }
    }

    // Here you would typically send the phone number to your backend
    console.log("Subscribed phone number:", phoneNumber);
    
    // Close popup and optionally save to localStorage so it doesn't show again
    setShowNotificationPopup(false);
  };
  // --------------------------------

  async function loadHospitals(query) {
    setLoadingHospitals(true);
    setError(null);
    try {
      const res = await api.get(`/hospitals${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      setHospitals(res.data || []);
      if (!selectedHospitalId && res.data?.length) setSelectedHospitalId(res.data[0]._id);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load hospitals");
    } finally {
      setLoadingHospitals(false);
    }
  }

  async function loadQueues(hospitalId) {
    setLoadingQueues(true);
    setError(null);
    try {
      const res = await api.get(`/queues/${hospitalId}`);
      setQueues(res.data || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load queues");
    } finally {
      setLoadingQueues(false);
    }
  }

  useEffect(() => {
    loadHospitals("");
  }, []);

  useEffect(() => {
    if (selectedHospitalId) loadQueues(selectedHospitalId);
  }, [selectedHospitalId]);

  const selectedHospital = useMemo(
    () => hospitals.find((h) => h._id === selectedHospitalId),
    [hospitals, selectedHospitalId]
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 relative overflow-hidden">

      {/* ══════════════════════════════ NAVBAR ══════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-[#42a19c] rounded-lg flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">LineLess</h1>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Digital Queue</span>
            </div>
          </Link>

          <Link
            to="/admin"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#42a19c] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin Panel
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════ PAGE BODY ═══════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Hero & Search Section */}
        <section className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#42a19c] text-xs font-bold tracking-wide uppercase mb-6 border border-teal-100">
            <span className="w-2 h-2 rounded-full bg-[#42a19c] animate-pulse"></span>
            System Live
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Skip the Queue, <span className="text-[#42a19c]">Not your health.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Get a digital token and track your position in real-time. Arrive only when it's your turn — no more crowded waiting rooms.
          </p>

          {/* Connected Search Bar Component */}
          <div className="relative max-w-xl mx-auto shadow-sm rounded-xl overflow-hidden flex border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-[#42a19c] focus-within:border-[#42a19c] transition-all">
            <div className="w-12 flex items-center justify-center pointer-events-none flex-shrink-0">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="search"
              className="block w-full py-3 pr-4 text-slate-900 bg-transparent outline-none placeholder:text-slate-400 sm:text-base"
              placeholder="Search by hospital name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadHospitals(search)}
            />
            <button
              onClick={() => loadHospitals(search)}
              disabled={loadingHospitals}
              className="bg-[#42a19c] hover:bg-[#35827e] text-white font-semibold px-6 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center"
            >
              {loadingHospitals ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </section>

        {/* ══════════════════════════════ MAIN GRID ═══════════════════════ */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar: Hospital List ── */}
          <aside className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase">Available Hospitals</h3>
                <span className="bg-slate-200 text-slate-600 py-0.5 px-2.5 rounded-full text-xs font-bold">
                  {hospitals.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                {loadingHospitals ? (
                  // Skeleton Loading State
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-white animate-pulse">
                      <div className="w-12 h-12 bg-slate-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : hospitals.length > 0 ? (
                  hospitals.map((h) => {
                    const isActive = h._id === selectedHospitalId;
                    return (
                      <div
                        key={h._id}
                        onClick={() => setSelectedHospitalId(h._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && setSelectedHospitalId(h._id)}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${isActive
                          ? "bg-teal-50 border-[#42a19c] ring-1 ring-[#42a19c]"
                          : "bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm"
                          } border`}
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${isActive ? 'bg-teal-100 text-[#42a19c]' : 'bg-slate-100'}`}>
                          🏥
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-base font-semibold truncate ${isActive ? 'text-teal-900' : 'text-slate-900'}`}>
                            {h.name}
                          </h4>
                          <p className="text-sm text-slate-500 truncate mt-0.5">📍 {h.location}</p>
                        </div>
                        {isActive && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#42a19c] flex-shrink-0 ml-2"></div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Empty State
                  <div className="text-center p-8 bg-white border border-slate-200 rounded-xl">
                    <div className="text-4xl mb-3">📭</div>
                    <h4 className="font-semibold text-slate-900 mb-1">No hospitals found</h4>
                    <p className="text-sm text-slate-500">Try adjusting your search terms.</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Right Panel: Selected Hospital Details & Queues ── */}
          <main className="w-full lg:w-2/3 xl:w-3/4">
            {selectedHospital ? (
              <div className="space-y-8">

                {/* Hospital Header Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                    🏥
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedHospital.name}</h2>
                    <p className="text-slate-600 flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedHospital.location}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Verified Facility
                      </span>
                      <span className="px-3 py-1 bg-teal-50 text-[#42a19c] border border-teal-200 rounded-full text-xs font-semibold">
                        Digital Queue Enabled
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    Available Departments
                    {!loadingQueues && (
                      <span className="bg-slate-100 text-slate-600 py-0.5 px-2.5 rounded-full text-xs font-bold">
                        {queues.length}
                      </span>
                    )}
                  </h3>

                  {loadingQueues ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "14px",
                      }}
                    >
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="bg-white border border-slate-200 rounded-2xl animate-pulse"
                          style={{ height: 280 }}
                        />
                      ))}
                    </div>
                  ) : queues.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                        gap: "14px",
                      }}
                    >
                      {queues.map((q) => {
                        const live = q.liveState || {};
                        const currentToken = live.currentToken ?? 0;
                        const waitingCount = live.waitingCount ?? 0;
                        const estWait = waitingCount * (q.avgTimePerUser || 5);
                        const origin =
                          typeof window !== "undefined" ? window.location.origin : "";
                        const joinUrl = `/hospital/${q.hospitalId}/queue/${q._id}`;

                        return (
                          <div
                            key={q._id}
                            className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col group"
                            style={{ transition: "box-shadow 0.2s, border-color 0.2s" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                              e.currentTarget.style.borderColor = "#42a19c";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = "none";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }}
                          >
                            {/* Top accent bar */}
                            <div
                              style={{
                                height: 3,
                                background: "linear-gradient(90deg, #42a19c 0%, #5bbfba 100%)",
                                opacity: 0,
                                transition: "opacity 0.2s",
                              }}
                              className="group-hover:opacity-100"
                            />

                            {/* Card body */}
                            <div className="p-4 flex flex-col gap-3 flex-1">

                              {/* Row 1 — Department name + serving token */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4
                                    className="font-bold text-slate-900 leading-tight"
                                    style={{ fontSize: "0.95rem" }}
                                  >
                                    {q.name}
                                  </h4>
                                  <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                                    <svg
                                      style={{ width: 11, height: 11, flexShrink: 0 }}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    ~{q.avgTimePerUser} min / person
                                  </p>
                                </div>

                                {/* Serving token badge */}
                                <div
                                  className="flex-shrink-0 text-center rounded-xl border border-slate-100 bg-slate-50"
                                  style={{ padding: "5px 12px", minWidth: 58 }}
                                >
                                  <div
                                    className="font-bold uppercase tracking-wider text-slate-400"
                                    style={{ fontSize: "0.52rem" }}
                                  >
                                    Serving
                                  </div>
                                  <div
                                    className="font-black leading-none"
                                    style={{ fontSize: "1.65rem", color: "#42a19c" }}
                                  >
                                    {currentToken}
                                  </div>
                                </div>
                              </div>

                              {/* Row 2 — Wait status chip */}
                              {waitingCount > 0 ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold w-fit border border-amber-100">
                                  <span className="relative flex" style={{ width: 8, height: 8 }}>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                    <span
                                      className="relative inline-flex rounded-full bg-amber-500"
                                      style={{ width: 8, height: 8 }}
                                    />
                                  </span>
                                  ~{estWait} min wait
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold w-fit border border-green-100">
                                  <span
                                    className="rounded-full bg-green-500"
                                    style={{ width: 8, height: 8, display: "inline-block" }}
                                  />
                                  No line now
                                </div>
                              )}

                              {/* Row 3 — Waiting count + Your token */}
                              <div className="grid grid-cols-2 gap-2">
                                <div
                                  className="bg-slate-50 border border-slate-100 rounded-xl text-center"
                                  style={{ padding: "8px 6px" }}
                                >
                                  <div
                                    className="text-slate-400 font-semibold uppercase tracking-wider"
                                    style={{ fontSize: "0.58rem" }}
                                  >
                                    Waiting
                                  </div>
                                  <div
                                    className="font-bold text-slate-800 mt-0.5"
                                    style={{ fontSize: "1.15rem" }}
                                  >
                                    {waitingCount}
                                  </div>
                                </div>
                                <div
                                  className="rounded-xl text-center border"
                                  style={{
                                    padding: "8px 6px",
                                    background: "#f0fafa",
                                    borderColor: "#c4e8e6",
                                  }}
                                >
                                  <div
                                    className="font-semibold uppercase tracking-wider"
                                    style={{ fontSize: "0.58rem", color: "#42a19c" }}
                                  >
                                    Your Token
                                  </div>
                                  <div
                                    className="font-bold mt-0.5"
                                    style={{ fontSize: "1.15rem", color: "#2d7a76" }}
                                  >
                                    #{currentToken + waitingCount + 1}
                                  </div>
                                </div>
                              </div>

                              {/* Row 4 — Join Queue button */}
                              <div className="mt-auto pt-1">
                                <Link
                                  to={joinUrl}
                                  className="w-full flex items-center justify-center gap-2 font-semibold text-white rounded-xl"
                                  style={{
                                    background: "#42a19c",
                                    padding: "10px 16px",
                                    fontSize: "0.875rem",
                                    transition: "background 0.18s",
                                    textDecoration: "none",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = "#35827e")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "#42a19c")
                                  }
                                >
                                  Join Queue
                                  <svg
                                    style={{ width: 15, height: 15, flexShrink: 0 }}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2.5"
                                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                  </svg>
                                </Link>
                              </div>

                              {/* Row 5 — QR Code (compact inline strip) */}
                              <QRCodeCard
                                value={`${origin}${joinUrl}`}
                                label="Scan to join on mobile"
                                compact={true}
                              />

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                      <div
                        className="bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-3"
                        style={{ width: 56, height: 56 }}
                      >
                        📭
                      </div>
                      <h3 className="text-base font-bold text-slate-800 mb-1">
                        No active queues
                      </h3>
                      <p className="text-slate-400 text-sm max-w-xs">
                        This hospital hasn't set up any digital queues yet. Please check
                        with the administration desk.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Main Panel Empty State (When no hospital is clicked)
              <div className="bg-white border border-slate-200 rounded-2xl p-12 h-full min-h-[400px] flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-[#42a19c] mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Select a facility</h3>
                <p className="text-slate-500 max-w-md">
                  Choose a hospital from the list on the left to view available departments and join the digital queue.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ══════════════════════════════ NOTIFICATION POPUP ══════════════════════════ */}
      {showNotificationPopup && (
        <div className="fixed bottom-6 right-6 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 z-[100] animate-fade-in-up">
          <button 
            onClick={() => setShowNotificationPopup(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close notification popup"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-[#42a19c] mb-4 shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          
          <h4 className="font-bold text-slate-900 mb-2 text-lg leading-tight">Get Live Updates</h4>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">
            Allow notifications and enter your phone number to receive SMS alerts when your turn is near.
          </p>
          
          <form onSubmit={handleNotificationSubmit}>
            <input 
              type="tel" 
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 9876543210" 
              className="w-full text-sm p-3 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:border-[#42a19c] focus:ring-1 focus:ring-[#42a19c] transition-all"
            />
            <button 
              type="submit"
              className="w-full bg-[#42a19c] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#35827e] transition-colors shadow-sm flex justify-center items-center gap-2"
            >
              Notify Me
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}