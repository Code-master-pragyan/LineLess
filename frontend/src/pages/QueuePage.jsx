import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { api } from "../api/client";
import Header from "../components/Header";
import StatusCard from "../components/StatusCard";
import PaymentModal from "../components/PaymentModal";
import QRCodeCard from "../components/QRCodeCard";
import QueueVisualization from "../components/QueueVisualization";
import { clearUserToken, loadUserToken, saveUserToken } from "../lib/storage";

function formatMinutes(min) {
  const m = Math.max(0, Math.round(min));
  return `${m}`;
}

export default function QueuePage() {
  const { hospitalId, queueId } = useParams();
  const socketRef = useRef(null);

  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  const stored = useMemo(() => loadUserToken(), []);
  const existingToken =
    stored && stored.queueId === queueId && stored.hospitalId === hospitalId
      ? stored.tokenNumber
      : null;

  const [userTokenNumber, setUserTokenNumber] = useState(existingToken);

  const userPeopleAhead = useMemo(() => {
    if (!live || userTokenNumber == null) return null;
    if (live.userStatus?.peopleAhead != null) return live.userStatus.peopleAhead;
    const waitingAhead = (live.waitingTokens || []).filter((n) => n < userTokenNumber);
    return waitingAhead.length;
  }, [live, userTokenNumber]);

  const estimatedWaitMinutes = useMemo(() => {
    if (userPeopleAhead == null || !live) return null;
    if (live.userStatus?.estimatedWaitMinutes != null) {
      return live.userStatus.estimatedWaitMinutes;
    }
    return userPeopleAhead * (live.avgTimePerUser || 0);
  }, [userPeopleAhead, live]);

  const userStatus = useMemo(() => {
    if (!live || userTokenNumber == null) return null;
    if (live.userStatus?.status) return live.userStatus.status;
    const isWaiting = (live.waitingTokens || []).includes(userTokenNumber);
    if (isWaiting) return "waiting";
    if (userTokenNumber <= (live.currentToken || 0)) return "called";
    return "queued";
  }, [live, userTokenNumber]);

  const progress = useMemo(() => {
    if (!live || userTokenNumber == null || userPeopleAhead == null) return 0;
    const denom = (live.waitingCount || 0) + 1;
    const num = userPeopleAhead + 1;
    return denom > 0 ? Math.min(1, num / denom) : 0;
  }, [live, userTokenNumber, userPeopleAhead]);

  async function fetchLive(tokenNumberForUser) {
    setError(null);
    try {
      const url = tokenNumberForUser
        ? `/queue-status/${queueId}?tokenNumber=${encodeURIComponent(tokenNumberForUser)}`
        : `/queue-status/${queueId}`;
      const res = await api.get(url);
      setLive(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLive(userTokenNumber);
  }, [queueId]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(apiUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinQueue", { queueId });
    });

    socket.on("queue:update", (payload) => {
      setLive(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [queueId]);

  async function joinQueueAfterPayment() {
    if (joining) return;
    setJoining(true);
    setError(null);
    try {
      const res = await api.post(`/token/${queueId}`, { mockPayment: true });
      const { tokenNumber } = res.data || {};
      if (!tokenNumber) throw new Error("Token number missing in response");

      setUserTokenNumber(tokenNumber);
      saveUserToken({ hospitalId, queueId, tokenNumber });
      setPayOpen(false);

      await fetchLive(tokenNumber);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to join queue");
    } finally {
      setJoining(false);
    }
  }

  const queueName = live?.queueName || "Queue";
  const currentToken = live?.currentToken ?? 0;
  const yourToken = userTokenNumber ?? "—";
  const yourBackendStatus = live?.userStatus?.status || null;

  return (
    <div className="min-h-screen bg-gradient-medical">
      <Header backLink="/" title="Queue Tracker" subtitle="Real-time position tracking" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatusCard label="Queue" value={queueName} />
              <StatusCard label="Now Serving" value={currentToken} />
              <StatusCard label="Your Token" value={yourToken} />
            </div>

            {live && <QueueVisualization live={live} userTokenNumber={userTokenNumber} />}

            {userTokenNumber ? (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Position</h3>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">People Ahead:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {userPeopleAhead ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estimated Wait:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {estimatedWaitMinutes != null
                            ? `${formatMinutes(estimatedWaitMinutes)} min`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-sm font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">
                          {yourBackendStatus || "Waiting"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <QRCodeCard tokenNumber={userTokenNumber} />
              </div>
            ) : (
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Join the queue to get your token</p>
                <button
                  onClick={() => setPayOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                >
                  Join Queue
                </button>
              </div>
            )}
          </>
        )}

        <PaymentModal
          isOpen={payOpen}
          onClose={() => setPayOpen(false)}
          onConfirm={joinQueueAfterPayment}
          loading={joining}
        />
      </div>
    </div>
  );
}

