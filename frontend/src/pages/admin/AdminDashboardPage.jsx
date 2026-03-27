import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { api } from "../../api/client";
import Header from "../../components/Header";
import { clearAdminToken, loadAdminToken } from "../../lib/storage";

function getAuthHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// Helper to format 24h time to 12h AM/PM format
function formatTime(timeStr) {
  if (!timeStr) return null;
  const [hourString, minute] = timeStr.split(":");
  const hour = +hourString % 24;
  return (hour % 12 || 12) + ":" + minute + (hour < 12 ? " AM" : " PM");
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [adminToken, setAdminToken] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [queuesByHospital, setQueuesByHospital] = useState({});
  const [queueLiveById, setQueueLiveById] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create hospital form
  const [hName, setHName] = useState("");
  const [hLocation, setHLocation] = useState("");

  // Add queue form
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [qName, setQName] = useState("");
  const [qAvg, setQAvg] = useState(5);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const allQueueIds = useMemo(() => {
    const ids = [];
    for (const hid of Object.keys(queuesByHospital)) {
      for (const q of queuesByHospital[hid] || []) ids.push(q._id);
    }
    return ids;
  }, [queuesByHospital]);

  const totals = useMemo(() => {
    const hospitalCount = hospitals.length;
    let queueCount = 0;
    let waitingTotal = 0;

    for (const hid of Object.keys(queuesByHospital)) {
      const qs = queuesByHospital[hid] || [];
      queueCount += qs.length;
      for (const q of qs) {
        const live = queueLiveById[q._id] || q.liveState || {};
        waitingTotal += live.waitingCount ?? 0;
      }
    }

    return { hospitalCount, queueCount, waitingTotal };
  }, [hospitals.length, queuesByHospital, queueLiveById]);

  async function refreshAll() {
    setLoading(true);
    setError(null);
    try {
      const hospRes = await api.get("/hospitals");
      const hospList = hospRes.data || [];
      setHospitals(hospList);
      if (!selectedHospitalId && hospList[0]?._id) setSelectedHospitalId(hospList[0]._id);

      const queuesResults = await Promise.all(
        hospList.map((h) => api.get(`/queues/${h._id}`))
      );
      const nextMap = {};
      hospList.forEach((h, idx) => {
        nextMap[h._id] = queuesResults[idx].data || [];
      });
      setQueuesByHospital(nextMap);

      setQueueLiveById({});
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load administrative data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = loadAdminToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }
    setAdminToken(token);
  }, [navigate]);

  useEffect(() => {
    if (!adminToken) return;
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken) return;
    const socket = io(apiUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      allQueueIds.forEach((queueId) => socket.emit("joinQueue", { queueId }));
    });

    socket.on("queue:update", (payload) => {
      if (payload?.queueId) {
        setQueueLiveById((prev) => ({ ...prev, [payload.queueId]: payload }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [adminToken, apiUrl]); 

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    allQueueIds.forEach((queueId) => socket.emit("joinQueue", { queueId }));
  }, [allQueueIds]);

  async function createHospital(e) {
    e.preventDefault();
    if (!hName.trim() || !hLocation.trim()) return;

    try {
      await api.post(
        "/hospitals",
        { name: hName.trim(), location: hLocation.trim() },
        { headers: getAuthHeaders(adminToken) }
      );
      setHName("");
      setHLocation("");
      await refreshAll();
    } catch (e2) {
      setError(e2?.response?.data?.error || e2.message || "Failed to register new hospital");
    }
  }

  async function addQueue(e) {
    e.preventDefault();
    if (!selectedHospitalId || !qName.trim()) return;

    try {
      await api.post(
        "/queues",
        { 
          hospitalId: selectedHospitalId, 
          name: qName.trim(), 
          avgTimePerUser: qAvg,
          startTime: startTime || null,
          endTime: endTime || null
        },
        { headers: getAuthHeaders(adminToken) }
      );
      setQName("");
      setQAvg(5);
      setStartTime("");
      setEndTime("");
      await refreshAll();
    } catch (e2) {
      setError(e2?.response?.data?.error || e2.message || "Failed to initialize new queue");
    }
  }

  async function handleNext(queueId) {
    setError(null);
    try {
      const res = await api.post("/next/" + queueId, {}, { headers: getAuthHeaders(adminToken) });
      if (res.data?.liveState?.queueId) {
        setQueueLiveById((prev) => ({ ...prev, [res.data.liveState.queueId]: res.data.liveState }));
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to advance to next token");
    }
  }

  async function handleSkip(queueId) {
    setError(null);
    try {
      const res = await api.post("/skip/" + queueId, {}, { headers: getAuthHeaders(adminToken) });
      if (res.data?.liveState?.queueId) {
        setQueueLiveById((prev) => ({ ...prev, [res.data.liveState.queueId]: res.data.liveState }));
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to skip current token");
    }
  }

  // NEW: Handle Cancel/Delete Queue
  async function handleCancelQueue(queueId) {
    if (!window.confirm("Are you sure you want to cancel this queue? This will remove the queue entirely.")) return;
    
    setError(null);
    try {
      await api.delete("/queues/" + queueId, { headers: getAuthHeaders(adminToken) });
      await refreshAll();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to cancel queue");
    }
  }

  const logout = () => {
    clearAdminToken();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Header
        title="Administrative Dashboard"
        subtitle="Manage hospital queues and tokens in real-time"
        showAdminLink={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
            <p className="text-sm text-slate-500">Monitor and configure all facility operations</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#42a19c] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Secure Logout
          </button>
        </div>

        {/* Top Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-teal-50 text-[#42a19c] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Hospitals</p>
              <p className="text-2xl font-bold text-slate-900">{totals.hospitalCount}</p>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Queues</p>
              <p className="text-2xl font-bold text-slate-900">{totals.queueCount}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${totals.waitingTotal > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Waiting Patients</p>
              <p className="text-2xl font-bold text-slate-900">{totals.waitingTotal}</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 shadow-sm">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <p className="text-sm text-red-700 mt-1">Please try your request again.</p>
            </div>
          </div>
        )}

        {/* Configuration Forms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Create Hospital Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="p-1.5 bg-teal-50 rounded-lg text-[#42a19c]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              </div>
              Register Facility
            </h3>
            <form onSubmit={createHospital} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Facility Name</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-[#42a19c] focus:border-[#42a19c] outline-none transition-colors"
                  value={hName}
                  onChange={(e) => setHName(e.target.value)}
                  placeholder="e.g., City Medical Center"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location / City</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-[#42a19c] focus:border-[#42a19c] outline-none transition-colors"
                  value={hLocation}
                  onChange={(e) => setHLocation(e.target.value)}
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>
              <button
                type="submit"
                disabled={!hName.trim() || !hLocation.trim()}
                className="w-full rounded-lg bg-[#42a19c] hover:bg-[#35827e] text-white px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                Create Facility
              </button>
            </form>
          </div>

          {/* Add Queue Form (UPDATED WITH SITTING TIME) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              Initialize Queue (Doctor/Counter)
            </h3>
            <form onSubmit={addQueue} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Facility</label>
                <select
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-[#42a19c] focus:border-[#42a19c] outline-none transition-colors bg-white"
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                >
                  <option value="">Select a facility...</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Queue Designation</label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-[#42a19c] focus:border-[#42a19c] outline-none transition-colors"
                  value={qName}
                  onChange={(e) => setQName(e.target.value)}
                  placeholder="e.g., Counter 1, Dr. Singh"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-[#42a19c] focus:border-[#42a19c] outline-none transition-colors"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
                  <input
                    type="time"
                    className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-[#42a19c] focus:border-[#42a19c] outline-none transition-colors"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Avg Time per Patient (mins)</label>
                <input
                  type="number"
                  min="1"
                  className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:ring-[#42a19c] focus:border-[#42a19c] outline-none transition-colors"
                  value={qAvg}
                  onChange={(e) => setQAvg(Number(e.target.value))}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedHospitalId || !qName.trim()}
                className="w-full rounded-lg bg-[#42a19c] hover:bg-[#35827e] text-white px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                Initialize Queue
              </button>
            </form>
          </div>
        </div>

        {/* Hospitals & Queues Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Facility Management</h2>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
              <svg className="animate-spin h-10 w-10 text-[#42a19c] mx-auto mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-slate-500 font-medium">Retrieving facility data...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-16 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No Facilities Found</h3>
              <p className="text-slate-500">Register your first facility above to begin managing operations.</p>
            </div>
          ) : (
            hospitals.map((hospital) => {
              const queues = queuesByHospital[hospital._id] || [];

              return (
                <div key={hospital._id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  
                  {/* Hospital Header */}
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[#42a19c] shadow-sm">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{hospital.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          {hospital.location}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm w-fit">
                      <span className="text-xs font-semibold uppercase text-slate-500">Active Queues</span>
                      <span className="bg-teal-50 text-[#42a19c] py-0.5 px-2 rounded-md font-bold text-sm">{queues.length}</span>
                    </div>
                  </div>

                  {/* Queues Grid */}
                  <div className="p-6">
                    {queues.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-sm text-slate-500">No queues have been configured for this facility.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {queues.map((queue) => {
                          const live = queueLiveById[queue._id] || queue.liveState || {};
                          const waiting = live.waitingCount ?? 0;
                          const waitingTokens = live.waitingTokens || [];
                          const currentToken = live.currentToken ?? 0;
                          const nextToken = live.nextTokenNumber ?? currentToken + waiting + 1;

                          return (
                            <div key={queue._id} className="border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-[#42a19c] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              
                              <div className="p-5 flex-1 flex flex-col">
                                
                                {/* Header with Details and Cancel Button */}
                                <div className="flex justify-between items-start mb-5 relative">
                                  <div className="pr-8">
                                    <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{queue.name}</h4>
                                    
                                    {/* Display Time if Available */}
                                    {(queue.startTime || queue.endTime) && (
                                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        {formatTime(queue.startTime) || "?"} - {formatTime(queue.endTime) || "?"}
                                      </p>
                                    )}

                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                      ~{queue.avgTimePerUser} min avg.
                                    </p>
                                  </div>

                                  {/* Cancel / Delete Queue Button */}
                                  <button
                                    onClick={() => handleCancelQueue(queue._id)}
                                    title="Cancel / Delete Queue"
                                    className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>

                                <div className="text-right bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg mb-4 w-fit ml-auto">
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mb-0.5">Serving</div>
                                  <div className="text-2xl font-black text-[#42a19c] leading-none">#{currentToken}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
                                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Waiting</div>
                                    <div className="text-lg font-bold text-slate-900">{waiting}</div>
                                  </div>
                                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Next Token</div>
                                    <div className="text-lg font-bold text-slate-700">#{nextToken}</div>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                  <button
                                    onClick={() => handleNext(queue._id)}
                                    disabled={waiting === 0}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#42a19c] hover:bg-[#35827e] text-white py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
                                    Call Next
                                  </button>
                                  <button
                                    onClick={() => handleSkip(queue._id)}
                                    disabled={waiting === 0}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"/></svg>
                                    Skip
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}