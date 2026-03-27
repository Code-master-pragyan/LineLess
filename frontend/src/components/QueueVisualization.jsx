import React, { useMemo } from "react";

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

    const maxAfter = Math.max(0, maxTotal - 1);

    if (!waiting.length) return { ...result, visibleWaiting: [] };

    if (you != null && waiting.includes(you)) {
      result.isYourWaitingToken = true;
      result.yourTokenPosition = waiting.indexOf(you);

      const idx = result.yourTokenPosition;
      const start = Math.max(0, idx - 2);
      const end = Math.min(waiting.length, start + maxAfter);

      result.prefixGap = start > 0;
      result.suffixGap = end < waiting.length;
      result.visibleWaiting = waiting.slice(start, end);

      return result;
    }

    const end = Math.min(waiting.length, maxAfter);
    result.visibleWaiting = waiting.slice(0, end);
    result.suffixGap = end < waiting.length;

    return result;
  }, [waiting, you, maxTotal]);

  const yourIsCalledOrPassed =
    you != null && (Number.isNaN(you) || you <= cur || !waiting.includes(you));

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
      
      {/* HEADER */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            📊 Queue Visualization
          </h2>
          <p className="text-sm text-gray-500">
            Live tracking from current token onwards
          </p>
        </div>

        <div className="text-xs bg-gray-100 px-3 py-2 rounded-lg text-gray-600">
          <div><b>ID:</b> {queueId}</div>
          <div><b>Hospital:</b> {hospitalId}</div>
        </div>
      </div>

      {/* STATUS PILLS */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow">
          Now Serving: {cur}
        </span>

        {you != null ? (
          isYourWaitingToken ? (
            <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
              🎯 Your Token: {you}
            </span>
          ) : yourBackendStatus === "skipped" ? (
            <span className="px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
              ⏭️ Skipped: {you}
            </span>
          ) : yourBackendStatus === "completed" ? (
            <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
              ✓ Completed: {you}
            </span>
          ) : (
            <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
              Passed: {you}
            </span>
          )
        ) : (
          <span className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
            Join queue to track
          </span>
        )}
      </div>

      {/* FLOW */}
      <div className="mt-6">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
          Queue Flow
        </p>

        <div className="flex items-center gap-3 overflow-x-auto pb-2">

          {/* CURRENT TOKEN */}
          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105">
            <span className="font-bold text-lg">{cur}</span>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          </div>

          <span className="text-gray-400 text-xl">→</span>

          {/* PREFIX GAP */}
          {you != null && prefixGap && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              +{yourTokenPosition} ahead
            </span>
          )}

          {/* WAITING TOKENS */}
          {visibleWaiting.length > 0 ? (
            visibleWaiting.map((t) => (
              <div
                key={t}
                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  t === you
                    ? "bg-blue-100 border-blue-300 text-blue-800 scale-105"
                    : "bg-white border-gray-200 text-gray-800 hover:shadow-md"
                }`}
              >
                {t}
                {t === you && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 bg-blue-200 rounded-full">
                    YOU
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No waiting</span>
          )}

          {/* SUFFIX GAP */}
          {suffixGap && (
            <span className="text-xs text-gray-400">...</span>
          )}
        </div>

        {/* INFO BOX */}
        {you != null && !waiting.includes(you) && yourIsCalledOrPassed && (
          <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex gap-2">
            <span>ℹ️</span>
            <span>Your token has been called. Please proceed.</span>
          </div>
        )}
      </div>
    </div>
  );
}