import React, { useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeCard({ value, label }) {
  const safeValue = useMemo(() => String(value || ""), [value]);

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

