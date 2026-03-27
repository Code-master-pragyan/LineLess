import React from "react";

export default function StatusCard({
  label,
  value,
  detail,
  variant = "default", // default, success, pending, alert, medical
  isLoading = false,
  icon = null,
  trend = null, // "up" or "down"
}) {
  const variantStyles = {
    default: "bg-gray-50 border-gray-200",
    success: "bg-success-50 border-success-200",
    pending: "bg-pending-50 border-pending-200",
    alert: "bg-alert-50 border-alert-200",
    medical: "bg-medical-50 border-medical-200",
  };

  const textColorMap = {
    default: "text-gray-900",
    success: "text-success-900",
    pending: "text-pending-900",
    alert: "text-alert-900",
    medical: "text-medical-900",
  };

  const labelColorMap = {
    default: "text-gray-600",
    success: "text-success-700",
    pending: "text-pending-700",
    alert: "text-alert-700",
    medical: "text-medical-700",
  };

  return (
    <div
      className={`card card-hover ${variantStyles[variant]} animate-fade-in-up`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className={`text-xs font-semibold ${labelColorMap[variant]} uppercase tracking-wider`}>
            {label}
          </div>
          <div className={`text-3xl sm:text-4xl font-bold ${textColorMap[variant]} mt-2`}>
            {isLoading ? (
              <div className="skeleton w-24 h-10 animate-pulse" />
            ) : (
              <span className="inline-block transition-all duration-300">{value}</span>
            )}
          </div>
          {detail && (
            <div className="text-xs text-gray-600 mt-1.5">{detail}</div>
          )}
        </div>
        {icon && (
          <div className={`text-3xl opacity-20`}>{icon}</div>
        )}
      </div>

      {/* Trend indicator */}
      {trend && !isLoading && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={trend === "up" ? "text-success-600" : "text-alert-600"}>
            {trend === "up" ? "↑" : "↓"} {Math.abs(trend === "up" ? 1 : -1)}
          </span>
        </div>
      )}
    </div>
  );
}
