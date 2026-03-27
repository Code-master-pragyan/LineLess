import React, { useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";


export default function QRCodeCard({ value, label, compact = false }) {
  const safeValue = useMemo(() => String(value || ""), [value]);

  /* ── Compact mode — used inside queue cards ─────────────────────── */
  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "8px 10px",
        }}
      >
        {/* QR */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: 4,
            flexShrink: 0,
            lineHeight: 0,
          }}
        >
          <QRCodeCanvas value={safeValue} size={56} level="M" quietZone={2} />
        </div>

        {/* Text */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#475569",
              lineHeight: 1.3,
            }}
          >
            {label || "Scan to join on mobile"}
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#94a3b8",
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <line x1="12" y1="18" x2="12" y2="18" />
            </svg>
            Point your camera to scan
          </div>
        </div>
      </div>
    );
  }

  /* ── Full mode — standalone card ────────────────────────────────── */
  return (
    <div className="card card-hover group animate-fade-in-up">
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          {label || "Scan to Join"}
        </div>
        <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          📱
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200 transform group-hover:scale-105 transition-transform duration-300 shadow-sm">
          <QRCodeCanvas value={safeValue} size={100} level="M" quietZone={1} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-sm">
            {label ? "Open on mobile" : "Share with others"}
          </div>
          <div className="mt-2 break-all text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-200 font-mono overflow-hidden">
            {safeValue}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            💡 Tap your phone camera to scan
          </div>
        </div>
      </div>
    </div>
  );
}