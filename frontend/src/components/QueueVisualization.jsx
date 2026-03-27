import React, { useMemo } from "react";

function StatusPill({ children, className }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${className}`}
    >
      {children}
    </span>
  );
}

function TokenBadge({ token, isYou = false, isCurrent = false }) {
  return (
    <div
      key={token}
      className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 font-semibold transition-all duration-300 transform ${
        isCurrent
          ? "bg-gradient-to-r from-medical-600 to-blue-600 text-white border-transparent shadow-lg scale-110"
          : isYou
          ? "bg-medical-100 border-medical-300 text-medical-900 shadow-sm"
          : "bg-white border-gray-200 text-gray-900 hover:shadow-card"
      }`}
    >
      <span className={`text-lg font-bold ${isCurrent ? "text-white" : ""}`}>
        {token}
      </span>

      {isYou && !isCurrent && (
        <span className="ml-1 inline-block px-2 py-0.5 rounded-full bg-medical-200 text-medical-800 text-[10px] font-bold animate-pulse-soft">
          YOU
        </span>
      )}

      {isCurrent && (
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse-soft ml-1" />
      )}
    </div>
  );
}

export default function QueueVisualization({
  hospitalId,
  queueId,
  currentToken,
  waitingTokens,
  yourToken,
  yourBackendStatus,
  maxTotal = 12,
}) {
  const waiting = waitingTokens || [];
  const cur = Number(currentToken || 0);
  const you = yourToken == null ? null : Number(yourToken);

  const {
    visibleWaiting,
    prefixGap,
    suffixGap,
    isYourWaitingToken,
    yourTokenPosition,
  } = useMemo(() => {
    const result = {
      visibleWaiting: [],
      prefixGap: false,
      suffixGap: false,
      isYourWaitingToken: false,
      yourTokenPosition: null,
    };

    const maxAfter = Math.max(0, maxTotal - 1); // excluding current token
    if (!waiting.length) return { ...result, visibleWaiting: [] };

    if (you != null && waiting.includes(you)) {
      result.isYourWaitingToken = true;
      result.yourTokenPosition = waiting.indexOf(you); // index within waiting array

      const idx = result.yourTokenPosition;
      const start = Math.max(0, idx - 2);
      const end = Math.min(waiting.length, start + maxAfter);
      result.prefixGap = start > 0;
      result.suffixGap = end < waiting.length;
      result.visibleWaiting = waiting.slice(start, end);
      return result;
    }

    // Default: show from the start (closest to current token).
    const end = Math.min(waiting.length, maxAfter);
    result.visibleWaiting = waiting.slice(0, end);
    result.suffixGap = end < waiting.length;
    return result;
  }, [waiting, you, maxTotal]);

  const yourIsCalledOrPassed =
    you != null && (Number.isNaN(you) || you <= cur || !waiting.includes(you));

  return (
    <div className="card animate-fade-in-up">
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-gray-200">
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span>📊</span>
            Queue Visualization
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Real-time queue position from "Now serving" onward.
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <div className="font-semibold text-gray-700">Queue Info</div>
          <div className="mt-1">
            <div>Hospital: <span className="font-mono font-semibold">{hospitalId}</span></div>
            <div>Queue: <span className="font-mono font-semibold">{queueId}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill className="bg-gradient-to-r from-medical-600 to-blue-600 text-white border-transparent shadow-md">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse-soft mr-1.5" />
          Now Serving: {cur}
        </StatusPill>

        {you != null ? (
          isYourWaitingToken ? (
            <StatusPill className="bg-medical-100 border-medical-300 text-medical-900">
              <span>🎯</span> Your Position: {you}
            </StatusPill>
          ) : yourBackendStatus === "skipped" ? (
            <StatusPill className="bg-pending-100 border-pending-300 text-pending-900">
              <span>⏭️</span> Skipped: {you}
            </StatusPill>
          ) : yourBackendStatus === "completed" ? (
            <StatusPill className="bg-success-100 border-success-300 text-success-900">
              <span>✓</span> Completed: {you}
            </StatusPill>
          ) : (
            <StatusPill className="bg-gray-100 border-gray-300 text-gray-900">
              <span>→</span> Passed: {you}
            </StatusPill>
          )
        ) : (
          <StatusPill className="bg-gray-100 border-gray-300 text-gray-900">
            <span>🔍</span> Join to track position
          </StatusPill>
        )}
      </div>

      <div className="mt-6">
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Queue Flow</div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <TokenBadge token={cur} isCurrent={true} />
          <div className="text-gray-400 text-xl flex-shrink-0">→</div>

          {you != null && prefixGap ? (
            <div className="text-xs text-gray-500 font-semibold flex-shrink-0 px-2 py-1">
              ⋯ {yourTokenPosition} ahead ⋯
            </div>
          ) : null}

          {visibleWaiting.length > 0 ? (
            visibleWaiting.map((t) => (
              <TokenBadge key={t} token={t} isYou={you != null && t === you} />
            ))
          ) : (
            <div className="text-xs text-gray-500 italic">No one waiting</div>
          )}

          {suffixGap ? (
            <div className="text-xs text-gray-500 font-semibold flex-shrink-0 px-2 py-1">
              ⋯
            </div>
          ) : null}
        </div>

        {you != null && !waiting.includes(you) && yourIsCalledOrPassed ? (
          <div className="mt-4 text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <span>Your token has been called or completed. Visit the counter!</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

