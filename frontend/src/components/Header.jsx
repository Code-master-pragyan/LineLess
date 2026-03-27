import React from "react";
import { Link } from "react-router-dom";

export default function Header({ showAdminLink = true, title = null, subtitle = null, backLink = null }) {
  return (
    <header className="animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {backLink && (
              <Link
                to={backLink}
                className="rounded-xl border border-gray-200 bg-white/70 hover:bg-white px-3 py-2 text-sm transition-all duration-300 hover:shadow-card"
              >
                ← Back
              </Link>
            )}

            <div>
              {/* Logo and Title */}
              <Link to="/" className="flex items-center gap-2 group cursor-pointer mb-2">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-medical-600 to-blue-600 transform group-hover:scale-110 transition-transform duration-300 shadow-md" />
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-medical-600 to-blue-600 bg-clip-text text-transparent">
                  LineLess India
                </h1>
              </Link>

              {/* Page Title and Subtitle */}
              {(title || subtitle) && (
                <div className="mt-2 animate-fade-in-2">
                  {title && <p className="text-lg sm:text-xl font-semibold text-gray-800">{title}</p>}
                  {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Right Navigation */}
          {showAdminLink && (
            <nav className="flex items-center gap-3 animate-fade-in-3">
              <Link
                to="/admin"
                className="rounded-xl bg-medical-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-medical-700 transition-all duration-300 shadow-md hover:shadow-card-hover btn-interactive"
              >
                Admin
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
