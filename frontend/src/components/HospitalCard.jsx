import React from "react";

export default function HospitalCard({
  hospital,
  isActive = false,
  onClick = null,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="card animate-pulse p-4">
        <div className="skeleton w-3/4 h-6 mb-3" />
        <div className="skeleton w-1/2 h-4" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left card card-hover transition-all duration-300 transform hover:scale-102 group
        ${
          isActive
            ? "border-medical-500 bg-medical-50 shadow-card-hover ring-2 ring-medical-200"
            : "border-gray-200 bg-white hover:border-medical-300"
        }
      `}
    >
      {/* Hospital Icon/Avatar */}
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white text-lg transition-all duration-300 transform group-hover:scale-110
            ${
              isActive
                ? "bg-gradient-to-br from-medical-600 to-blue-600 shadow-md"
                : "bg-gradient-to-br from-medical-500 to-blue-500"
            }
          `}
        >
          🏥
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-lg group-hover:text-medical-600 transition-colors duration-300">
            {hospital.name}
          </div>
          <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <span>📍</span>
            <span className="truncate">{hospital.location}</span>
          </div>

          {/* Hospital Status Badge */}
          {isActive && (
            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-medical-200 text-medical-700 text-xs font-semibold animate-fade-in-2">
              <span className="inline-block w-2 h-2 rounded-full bg-medical-700 animate-pulse-soft" />
              Selected
            </div>
          )}
        </div>

        {/* Chevron Indicator */}
        <div
          className={`flex-shrink-0 text-lg transition-transform duration-300 transform ${
            isActive ? "translate-x-0 text-medical-600" : "-translate-x-2 text-gray-400 group-hover:translate-x-0"
          }`}
        >
          →
        </div>
      </div>
    </button>
  );
}
