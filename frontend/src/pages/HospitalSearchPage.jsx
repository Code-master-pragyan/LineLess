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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      
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
            Skip the Wait. <span className="text-[#42a19c]">Join Smarter.</span>
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
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                          isActive
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
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                        Verified Facility
                      </span>
                      <span className="px-3 py-1 bg-teal-50 text-[#42a19c] border border-teal-200 rounded-full text-xs font-semibold">
                        Digital Queue Enabled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Queues Section */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    Available Departments
                    {!loadingQueues && (
                      <span className="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs font-bold">
                        {queues.length}
                      </span>
                    )}
                  </h3>

                  {loadingQueues ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse h-64"></div>
                      ))}
                    </div>
                  ) : queues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {queues.map((q) => {
                        const live = q.liveState || {};
                        const currentToken = live.currentToken ?? 0;
                        const waitingCount = live.waitingCount ?? 0;
                        const estWait = waitingCount * (q.avgTimePerUser || 5);
                        const origin = typeof window !== "undefined" ? window.location.origin : "";
                        const joinUrl = `/hospital/${q.hospitalId}/queue/${q._id}`;

                        return (
                          <div key={q._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group">
                            {/* Accent line on top */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[#42a19c] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">{q.name}</h4>
                                <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                  ~{q.avgTimePerUser} min / person
                                </p>
                              </div>
                              <div className="text-right flex flex-col items-end bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Serving</span>
                                <span className="text-3xl font-black text-[#42a19c] leading-none">{currentToken}</span>
                              </div>
                            </div>

                            {waitingCount > 0 ? (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold mb-5 w-fit border border-amber-100">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                </span>
                                ~{estWait} min estimated wait
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-semibold mb-5 w-fit border border-green-100">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                No line currently
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Waiting</div>
                                <div className="text-xl font-bold text-slate-900">{waitingCount}</div>
                              </div>
                              <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center">
                                <div className="text-xs font-semibold uppercase tracking-wider text-[#42a19c] mb-1">Next Token</div>
                                <div className="text-xl font-bold text-teal-800">#{currentToken + waitingCount + 1}</div>
                              </div>
                            </div>

                            <div className="mt-auto space-y-3">
                              <Link
                                to={joinUrl}
                                className="w-full flex items-center justify-center gap-2 bg-[#42a19c] hover:bg-[#35827e] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm"
                              >
                                Join Queue
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </Link>
                              
                              <div className="w-full bg-slate-50 rounded-xl border border-slate-200 p-2 flex justify-center">
                                <QRCodeCard value={`${origin}${joinUrl}`} label="Scan to join on mobile" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">📭</div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No active queues</h3>
                      <p className="text-slate-500 max-w-sm">This hospital hasn't set up any digital queues yet. Please check with the administration desk.</p>
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
    </div>
  );
}