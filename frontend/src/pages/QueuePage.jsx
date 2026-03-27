import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { api } from "../api/client";
import Header from "../components/Header";
import PaymentModal from "../components/PaymentModal";
import QRCodeCard from "../components/QRCodeCard";
import QueueVisualization from "../components/QueueVisualization";
import { loadUserToken, saveUserToken } from "../lib/storage";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;
const TEAL        = "#42A19C";
const TEAL_LIGHT  = "#e8f5f5";
const TEAL_DARK   = "#35827e";
const TEAL_MUTED  = "#6dbfba";

function formatMinutes(min) {
  return `${Math.max(0, Math.round(min))}`;
}

/* ── Small reusable stat tile ───────────────────────────────────────── */
function Tile({ icon, label, value, accent = false, large = false }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: accent ? TEAL : "#fff",
      border: `1.5px solid ${accent ? "transparent" : "#e5e7eb"}`,
      borderRadius: 14,
      padding: large ? "22px 20px" : "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      boxShadow: accent
        ? "0 6px 24px rgba(66,161,156,0.22)"
        : "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: accent ? "rgba(255,255,255,0.65)" : "#9ca3af",
      }}>
        {icon && <span style={{ marginRight: 5 }}>{icon}</span>}{label}
      </div>
      <div style={{
        fontSize: large ? 26 : 20,
        fontWeight: 800,
        color: accent ? "#fff" : "#111827",
        lineHeight: 1.1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {value}
      </div>
    </div>
  );
}

/* ── Divider row inside info card ───────────────────────────────────── */
function InfoRow({ label, value, valueColor = "#111827", last = false }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "13px 0",
      borderBottom: last ? "none" : "1px solid #f3f4f6",
    }}>
      <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 17, fontWeight: 800, color: valueColor }}>{value}</span>
    </div>
  );
}

/* ── Section heading ────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.09em",
      textTransform: "uppercase",
      color: "#9ca3af",
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

/* ── Status config — all teal-toned, no blue ────────────────────────── */
const STATUS_MAP = {
  waiting:   { bg: TEAL_LIGHT,  color: TEAL_DARK,  dot: TEAL,       label: "Waiting"   },
  called:    { bg: "#d4f0ee",   color: "#2a6b68",  dot: TEAL_DARK,  label: "Called"    },
  queued:    { bg: "#fefce8",   color: "#92680a",  dot: "#d4a017",  label: "In Queue"  },
  completed: { bg: "#ecfdf5",   color: "#059669",  dot: "#10b981",  label: "Completed" },
  skipped:   { bg: "#fef2f2",   color: "#dc2626",  dot: "#ef4444",  label: "Skipped"   },
};

export default function QueuePage() {
  const { hospitalId, queueId } = useParams();
  const socketRef = useRef(null);

  const [live, setLive]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [hospitalName, setHospitalName] = useState(null);
  const [payOpen, setPayOpen]         = useState(false);
  const [joining, setJoining]         = useState(false);
  const [error, setError]             = useState(null);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [orderLoading, setOrderLoading]   = useState(false);

  const stored = useMemo(() => loadUserToken(), []);
  const existingToken =
    stored && stored.queueId === queueId && stored.hospitalId === hospitalId
      ? stored.tokenNumber : null;

  const [userTokenNumber, setUserTokenNumber] = useState(existingToken);

  const userPeopleAhead = useMemo(() => {
    if (!live || userTokenNumber == null) return null;
    if (live.userStatus?.peopleAhead != null) return live.userStatus.peopleAhead;
    return (live.waitingTokens || []).filter((n) => n < userTokenNumber).length;
  }, [live, userTokenNumber]);

  const estimatedWaitMinutes = useMemo(() => {
    if (userPeopleAhead == null || !live) return null;
    if (live.userStatus?.estimatedWaitMinutes != null) return live.userStatus.estimatedWaitMinutes;
    return userPeopleAhead * (live.avgTimePerUser || 0);
  }, [userPeopleAhead, live]);

  const yourBackendStatus = useMemo(() => {
    if (!live || userTokenNumber == null) return null;
    if (live.userStatus?.status) return live.userStatus.status;
    const isWaiting = (live.waitingTokens || []).includes(userTokenNumber);
    if (isWaiting) return "waiting";
    if (userTokenNumber <= (live.currentToken || 0)) return "called";
    return "queued";
  }, [live, userTokenNumber]);

  async function fetchLive(tokenNumberForUser) {
    setError(null);
    try {
      const url = tokenNumberForUser
        ? `/queue-status/${queueId}?tokenNumber=${encodeURIComponent(tokenNumberForUser)}`
        : `/queue-status/${queueId}`;
      const res = await api.get(url);
      setLive(res.data);

      if (res.data?.hospitalId && !hospitalName) {
        try {
          const hRes = await api.get(`/hospitals?id=${res.data.hospitalId}`);
          const h = Array.isArray(hRes.data) ? hRes.data[0] : hRes.data;
          if (h?.name) setHospitalName(h.name);
        } catch {
          // Silently fall back — show queue data's hospital name if available
        }
      }
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLive(userTokenNumber); }, [queueId]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const socket = io(apiUrl, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("joinQueue", { queueId }));
    socket.on("queue:update", (payload) => {
      setLive((prev) => ({
        ...payload,
        userStatus: payload.userStatus ?? prev?.userStatus ?? null,
      }));
    });
    return () => socket.disconnect();
  }, [queueId]);

  async function handleJoinClick() {
    setOrderLoading(true);
    setError(null);
    try {
      const res = await api.post(`/create-order`, { queueId });
      setRazorpayOrder({ id: res.data.orderId, amount: res.data.amount });
      setPayOpen(true);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Could not initiate payment.");
    } finally {
      setOrderLoading(false);
    }
  }

  async function handlePaymentSuccess(razorpayResponse) {
    if (joining) return;
    setJoining(true);
    setError(null);
    try {
      const res = await api.post(`/token/${queueId}`, {
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpayOrderId:   razorpayResponse.razorpay_order_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
      });
      const { tokenNumber } = res.data || {};
      if (!tokenNumber) throw new Error("Token number missing in response");
      setUserTokenNumber(tokenNumber);
      saveUserToken({ hospitalId, queueId, tokenNumber });
      setPayOpen(false);
      setRazorpayOrder(null);
      await fetchLive(tokenNumber);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to join queue");
    } finally {
      setJoining(false);
    }
  }

  /* ── Derived display values ─────────────────────────────────────── */
  const queueName      = live?.queueName || "Queue";
  const currentToken   = live?.currentToken ?? 0;
  // Prefer resolved hospitalName; fall back to what the live payload exposes; never show raw ID
  const displayHospital =
    hospitalName ||
    live?.hospitalName ||
    "Hospital";
  const qrUrl = `${window.location.origin}/hospital/${hospitalId}/queue/${queueId}`;
  const statusStyle = STATUS_MAP[yourBackendStatus] || STATUS_MAP.waiting;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f2f5f5",
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    }}>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:.45; } }
        .q-page { animation: fadeUp 0.35s ease both; }

        /* Stat tiles row */
        .stat-row { display:flex; gap:12px; }
        @media(max-width:540px){ .stat-row { flex-direction:column; } }

        /* Two-column grid for position + QR */
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: start;
        }
        @media(max-width:600px){ .detail-grid { grid-template-columns: 1fr; } }

        /* Queue-viz header row */
        .viz-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        /* Join button */
        .join-btn { transition: background 0.18s, transform 0.12s, box-shadow 0.18s; }
        .join-btn:hover:not(:disabled) {
          background: ${TEAL_DARK} !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(66,161,156,0.38) !important;
        }
        .join-btn:active:not(:disabled) { transform: scale(0.97) !important; }

        /* Override any stray blue links/badges that come from child components */
        a { color: ${TEAL} !important; }
      `}</style>

      {/* Teal accent hairline */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${TEAL}, #2dd4bf 60%, transparent)` }} />

      <Header
        backLink="/"
        title={`${displayHospital} · ${queueName}`}
        subtitle="Real-time queue tracking"
      />

      <div className="q-page" style={{ maxWidth: 820, margin: "0 auto", padding: "28px 16px 72px" }}>

        {/* ── Error banner ── */}
        {error && (
          <div style={{
            marginBottom: 18,
            padding: "11px 15px",
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            borderRadius: 10,
            color: "#b91c1c",
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}>
            <span style={{ flexShrink: 0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}>
            <div style={{
              width: 38, height: 38,
              border: "3px solid #d1d5db",
              borderTop: `3px solid ${TEAL}`,
              borderRadius: "50%",
              animation: "spin 0.75s linear infinite",
            }} />
          </div>
        ) : (
          <>
            {/* ── Breadcrumb ── */}
            <div style={{
              fontSize: 12,
              color: "#9ca3af",
              fontWeight: 500,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span>🏥</span>
              <span style={{ color: "#6b7280" }}>{displayHospital}</span>
              <span>›</span>
              <span style={{ color: TEAL, fontWeight: 700 }}>{queueName}</span>
            </div>

            {/* ── 3 stat tiles ── */}
            <div className="stat-row" style={{ marginBottom: 16 }}>
              <Tile label="Hospital"     value={displayHospital}                           icon="🏥" />
              <Tile label="Now Serving"  value={`Token #${currentToken}`}                  icon="📢" accent large />
              <Tile label="Your Token"   value={userTokenNumber ? `#${userTokenNumber}` : "Not joined"} icon="🎫" />
            </div>

            {/* ── Queue visualization ── */}
            {live && (
              <div style={{
                background: "#fff",
                border: "1.5px solid #e5e7eb",
                borderRadius: 14,
                padding: "18px 20px",
                marginBottom: 16,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                {/* Header row: human-readable names, not IDs */}
                <div className="viz-header">
                  <div>
                    <SectionLabel>Queue Visualization</SectionLabel>
                    <div style={{ fontSize: 13, color: "#374151", fontWeight: 600, marginTop: -6 }}>
                      {displayHospital}
                      <span style={{ color: "#d1d5db", margin: "0 6px" }}>·</span>
                      <span style={{ color: TEAL }}>{queueName}</span>
                    </div>
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: TEAL_DARK,
                    background: TEAL_LIGHT,
                    border: `1px solid ${TEAL}33`,
                    borderRadius: 8,
                    padding: "5px 11px",
                  }}>
                    Live
                  </div>
                </div>

                <QueueVisualization
                  hospitalId={live.hospitalId}
                  queueId={live.queueId}
                  hospitalName={displayHospital}
                  queueName={queueName}
                  currentToken={live.currentToken}
                  waitingTokens={live.waitingTokens}
                  yourToken={userTokenNumber}
                  yourBackendStatus={yourBackendStatus}
                />
              </div>
            )}

            {/* ── Post-join: position + QR ── */}
            {userTokenNumber ? (
              <div className="detail-grid">

                {/* ── Position card ── */}
                <div style={{
                  background: "#fff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 14,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                  <SectionLabel>Your Position</SectionLabel>

                  {/* Token hero */}
                  <div style={{
                    background: TEAL_LIGHT,
                    border: `1.5px solid ${TEAL}33`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 13, color: TEAL_DARK, fontWeight: 600 }}>Token Number</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: TEAL }}>#{userTokenNumber}</span>
                  </div>

                  <InfoRow
                    label="People Ahead"
                    value={userPeopleAhead ?? "—"}
                    valueColor={TEAL}
                  />
                  <InfoRow
                    label="Est. Wait"
                    value={estimatedWaitMinutes != null ? `${formatMinutes(estimatedWaitMinutes)} min` : "—"}
                    valueColor={TEAL}
                  />
                  <InfoRow
                    label="Queue"
                    value={queueName}
                    last
                  />

                  {/* Status badge */}
                  <div style={{
                    marginTop: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: "1px solid #f3f4f6",
                  }}>
                    <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Status</span>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "5px 13px",
                      borderRadius: 999,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                    }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: statusStyle.dot,
                        animation: yourBackendStatus === "waiting" ? "pulse 1.5s ease infinite" : "none",
                        flexShrink: 0,
                      }} />
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                {/* ── QR card ── */}
                <div style={{
                  background: "#fff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 14,
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                }}>
                  <SectionLabel>Scan &amp; Track</SectionLabel>
                  <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    paddingTop: 8,
                  }}>
                    <QRCodeCard value={qrUrl} label="Scan to open on mobile" />
                    <div style={{
                      marginTop: 8,
                      background: TEAL_LIGHT,
                      border: `1.5px solid ${TEAL}33`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      width: "100%",
                      textAlign: "center",
                    }}>
                      <span style={{ fontSize: 12, color: TEAL_DARK, fontWeight: 600 }}>
                        Show token #{userTokenNumber} at the counter
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            ) : (

              /* ── Join CTA ── */
              <div style={{
                background: "#fff",
                border: "1.5px solid #e5e7eb",
                borderRadius: 18,
                padding: "56px 28px 44px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                {/* Icon */}
                <div style={{
                  width: 76, height: 76,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${TEAL}18, ${TEAL}35)`,
                  border: `2px solid ${TEAL}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  margin: "0 auto 22px",
                }}>
                  🎟️
                </div>

                <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
                  Join {queueName}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, maxWidth: 300, margin: "0 auto 10px" }}>
                  at <strong style={{ color: "#374151" }}>{displayHospital}</strong>
                </div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 30 }}>
                  Pay ₹1 to get your digital token and track your position live.
                </div>

                {/* Queue stats strip */}
                {live && (
                  <div style={{
                    display: "inline-flex",
                    gap: 24,
                    background: "#f9fafb",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "10px 20px",
                    marginBottom: 28,
                  }}>
                    {[
                      { label: "Waiting",      value: live.waitingCount ?? 0 },
                      { label: "Now Serving",  value: `#${currentToken}` },
                      { label: "Next Token",   value: `#${live.nextTokenNumber ?? currentToken + 1}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{value}</div>
                        <div style={{
                          fontSize: 10, color: "#9ca3af", fontWeight: 600,
                          marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA button */}
                <div>
                  <button
                    className="join-btn"
                    onClick={handleJoinClick}
                    disabled={orderLoading}
                    style={{
                      background: orderLoading ? "#9ca3af" : TEAL,
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      padding: "15px 44px",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: orderLoading ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 9,
                      boxShadow: `0 4px 16px rgba(66,161,156,0.28)`,
                    }}
                  >
                    {orderLoading ? (
                      <>
                        <span style={{
                          display: "inline-block",
                          width: 15, height: 15,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTop: "2px solid #fff",
                          borderRadius: "50%",
                          animation: "spin 0.75s linear infinite",
                        }} />
                        Preparing...
                      </>
                    ) : (
                      <>💳 Join Queue — Pay ₹1</>
                    )}
                  </button>
                </div>

                {/* Trust badges */}
                <div style={{
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                  flexWrap: "wrap",
                }}>
                  {["🔒 Secured by Razorpay", "⚡ Instant token", "📍 Live position tracking"].map((b) => (
                    <span key={b} style={{ fontSize: 11, color: "#b0bec5", fontWeight: 500 }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <PaymentModal
        open={payOpen}
        onClose={() => { setPayOpen(false); setRazorpayOrder(null); }}
        onSuccess={handlePaymentSuccess}
        amount={razorpayOrder?.amount}
        orderId={razorpayOrder?.id}
        razorpayKey={RAZORPAY_KEY_ID}
      />
    </div>
  );
}