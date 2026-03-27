import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header({
  showAdminLink = true,
  title = null,
  subtitle = null,
  backLink = null,
}) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  /* deepen the nav bg slightly when user scrolls */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full transition-all duration-200",
        "border-b border-white/[0.06]",
        scrolled
          ? "bg-[#060d1a]/95 backdrop-blur-xl shadow-[0_1px_24px_rgba(0,0,0,0.45)]"
          : "bg-[#060d1a]/85 backdrop-blur-lg",
      ].join(" ")}
      role="banner"
    >
      {/* teal hairline glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-px bg-gradient-to-r from-transparent via-[#00d4aa]/25 to-transparent pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">

        {/* ── LEFT: back button + brand + page title ── */}
        <div className="flex items-center gap-3 min-w-0">

          {/* back button */}
          {backLink && (
            <Link
              to={backLink}
              className="flex-shrink-0 flex items-center gap-1.5 text-[#4a6285] hover:text-[#8ba3c7] text-xs font-medium border border-white/[0.08] hover:border-white/[0.14] bg-white/[0.03] hover:bg-white/[0.06] rounded-lg px-3 py-1.5 transition-all duration-150"
              aria-label="Go back"
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back
            </Link>
          )}

          {/* brand mark — always visible */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="LineLess India — Home"
          >
            {/* icon */}
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#00d4aa] to-[#38bdf8] flex items-center justify-center text-sm flex-shrink-0 shadow-[0_0_14px_rgba(0,212,170,0.32)] group-hover:shadow-[0_0_20px_rgba(0,212,170,0.48)] transition-shadow duration-200">
              🏥
            </div>

            {/* wordmark */}
            <div className="flex flex-col leading-none">
              <span className="text-[#e8f0fe] text-sm font-semibold tracking-tight group-hover:text-white transition-colors duration-150">
                LineLess India
              </span>
              <span className="text-[#3a5270] text-[9px] uppercase tracking-widest mt-0.5 hidden sm:block">
                Digital Queue System
              </span>
            </div>
          </Link>

          {/* live dot — shown when no page title */}
          {!title && (
            <div className="hidden sm:flex items-center gap-1.5 ml-1" aria-label="System live">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4aa] opacity-50" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00d4aa]" />
              </span>
              <span className="text-[#00d4aa] text-[10px] font-medium">Live</span>
            </div>
          )}

          {/* page title / subtitle — shown when provided */}
          {(title || subtitle) && (
            <>
              {/* separator */}
              <div className="hidden sm:block w-px h-5 bg-white/[0.1] flex-shrink-0 ml-1" aria-hidden="true" />

              <div className="min-w-0 hidden sm:block">
                {title && (
                  <p className="text-[#8ba3c7] text-sm font-medium leading-none truncate">
                    {title}
                  </p>
                )}
                {subtitle && (
                  <p className="text-[#3a5270] text-[11px] mt-0.5 leading-none truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── CENTER: live status pill (desktop only, when no title) ── */}
        {!title && (
          <div className="hidden lg:flex items-center gap-2 bg-[#00d4aa]/[0.06] border border-[#00d4aa]/[0.14] rounded-full px-4 py-1.5">
            <span className="relative flex w-1.5 h-1.5" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4aa] opacity-50" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00d4aa]" />
            </span>
            <span className="text-[#00d4aa] text-[11px] font-medium tracking-wide">
              Live Queue Tracking
            </span>
          </div>
        )}

        {/* ── RIGHT: nav actions ── */}
        <nav
          className="flex items-center gap-2 flex-shrink-0"
          aria-label="Header navigation"
        >
          {/* How it works — subtle text link */}
          <Link
            to="/how-it-works"
            className="hidden md:block text-[#4a6285] hover:text-[#8ba3c7] text-xs font-medium transition-colors duration-150 px-2"
          >
            How it works
          </Link>

          {/* Find hospitals */}
          <Link
            to="/hospitals"
            className="hidden sm:flex items-center gap-1.5 text-[#4a6285] hover:text-[#8ba3c7] text-xs font-medium border border-white/[0.08] hover:border-white/[0.14] bg-white/[0.03] hover:bg-white/[0.06] rounded-lg px-3 py-1.5 transition-all duration-150"
          >
            <svg
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Hospitals
          </Link>

          {/* divider */}
          {showAdminLink && (
            <div className="w-px h-4 bg-white/[0.08] hidden sm:block" aria-hidden="true" />
          )}

          {/* admin button */}
          {showAdminLink && (
            <Link
              to="/admin"
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                location.pathname.startsWith("/admin")
                  ? "bg-[#00d4aa]/15 border border-[#00d4aa]/35 text-[#00d4aa]"
                  : "bg-white/[0.05] border border-white/[0.10] text-[#8ba3c7] hover:bg-white/[0.09] hover:border-white/[0.18] hover:text-[#e8f0fe]",
              ].join(" ")}
              aria-label="Go to Admin Panel"
            >
              <svg
                width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              Admin
            </Link>
          )}
        </nav>

      </div>

      {/* mobile page title bar — shown below the main nav on small screens */}
      {(title || subtitle) && (
        <div className="sm:hidden border-t border-white/[0.05] px-5 py-2 bg-[#060d1a]/60">
          {title && (
            <p className="text-[#8ba3c7] text-xs font-medium leading-snug">{title}</p>
          )}
          {subtitle && (
            <p className="text-[#3a5270] text-[10px] mt-0.5 leading-snug">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}