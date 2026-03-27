import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ── small reusable icon ── */
function Icon({ d, size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const PATHS = {
  twitter:   "M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012 8v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
  linkedin:  "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z",
  instagram: "M12 2c2.717 0 3.056.01 4.122.06 2.908.14 4.278 1.524 4.417 4.417C20.99 7.444 21 7.783 21 12c0 2.717-.01 3.056-.06 4.122-.14 2.9-1.506 4.278-4.417 4.417C15.056 20.99 14.717 21 12 21c-2.717 0-3.056-.01-4.122-.06-2.905-.14-4.278-1.513-4.417-4.417C3.01 15.056 3 14.717 3 12c0-2.717.01-3.056.06-4.122C3.2 5.024 4.574 3.64 7.878 3.5 8.944 3.45 9.283 3.44 12 3.44zm0-2.163C9.259 0 8.889.014 7.797.072 3.717.272.273 3.712.073 7.797.014 8.89 0 9.259 0 12c0 2.741.014 3.111.072 4.203.2 4.083 3.638 7.525 7.725 7.725C8.889 23.986 9.259 24 12 24c2.741 0 3.111-.014 4.203-.072 4.085-.2 7.525-3.638 7.725-7.725C23.986 15.111 24 14.741 24 12c0-2.741-.014-3.11-.072-4.203-.2-4.085-3.638-7.525-7.725-7.725C15.111.014 14.741 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  youtube:   "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
  github:    "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22",
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  phone:     "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  location:  "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a1 1 0 100-2 1 1 0 000 2z",
  chevup:    "M18 15l-6-6-6 6",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  heart:     "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  check:     "M20 6L9 17l-5-5",
};

/* ── nav link item ── */
function FLink({ to, children }) {
  return (
    <Link
      to={to}
      className="text-[#4a6285] hover:text-[#00d4aa] text-xs leading-relaxed transition-colors duration-150 w-fit"
    >
      {children}
    </Link>
  );
}

/* ── column heading ── */
function ColHead({ children }) {
  return (
    <h4 className="text-[#8ba3c7] text-[11px] font-semibold uppercase tracking-widest mb-3">
      {children}
    </h4>
  );
}

export default function Footer() {
  const [email, setEmail]     = useState("");
  const [subDone, setSubDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSub(e) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setLoading(true);
    setTimeout(() => { setSubDone(true); setLoading(false); }, 800);
  }

  const year = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 bg-[#070e1c] border-t border-white/[0.06]"
      role="contentinfo"
    >

      {/* ── teal hairline glow on top edge ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px bg-gradient-to-r from-transparent via-[#00d4aa]/30 to-transparent pointer-events-none" />

      {/* ════════════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">

          {/* counters */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { icon: "🏥", num: "500+",   label: "Hospitals" },
              { icon: "👥", num: "2M+",    label: "Patients Served" },
              { icon: "⏱",  num: "18 min", label: "Avg Time Saved" },
              { icon: "🌆", num: "120+",   label: "Cities" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-sm" aria-hidden="true">{s.icon}</span>
                <span className="text-[#00d4aa] text-xs font-bold">{s.num}</span>
                <span className="text-[#3a5270] text-xs">{s.label}</span>
              </div>
            ))}
          </div>

          {/* trust badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {["ISO 27001", "HIPAA", "DPDP Act"].map(b => (
              <span
                key={b}
                className="inline-flex items-center gap-1 text-[10px] text-[#3a5270] border border-white/[0.07] rounded px-2 py-0.5"
              >
                <Icon d={PATHS.shield} size={10} />
                {b}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════
          MAIN COLUMNS
      ════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Col 1: Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">

            {/* brand mark */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 no-underline group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#38bdf8] flex items-center justify-center text-sm flex-shrink-0 shadow-[0_0_14px_rgba(0,212,170,0.3)]">
                🏥
              </div>
              <div>
                <div className="text-[#e8f0fe] text-sm font-semibold leading-none">LineLess India</div>
                <div className="text-[#3a5270] text-[9px] uppercase tracking-widest mt-0.5">Digital Queue System</div>
              </div>
            </Link>

            {/* live dot */}
            <div className="inline-flex items-center gap-1.5 mb-3">
              <span className="relative flex w-1.5 h-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4aa] opacity-60" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[#00d4aa]" />
              </span>
              <span className="text-[#00d4aa] text-[10px]">All Systems Live</span>
            </div>

            <p className="text-[#3a5270] text-xs leading-relaxed mb-4 max-w-[240px]">
              India's trusted digital queue platform — skip the waiting room and access healthcare smarter.
            </p>

            {/* newsletter */}
            <div className="mb-4">
              <p className="text-[#3a5270] text-[10px] uppercase tracking-widest mb-2">Stay updated</p>
              {subDone ? (
                <div className="flex items-center gap-1.5 text-[#00d4aa] text-xs">
                  <Icon d={PATHS.check} size={11} />
                  Subscribed — thanks!
                </div>
              ) : (
                <form onSubmit={handleSub} className="flex rounded-lg overflow-hidden border border-white/[0.08] focus-within:border-[#00d4aa]/40 transition-colors">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent text-[#8ba3c7] text-xs px-3 py-2 outline-none placeholder:text-[#2a3f58] min-w-0"
                    aria-label="Email for newsletter"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#00d4aa]/10 hover:bg-[#00d4aa]/20 border-l border-white/[0.08] text-[#00d4aa] text-[10px] font-semibold px-3 transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {loading ? "…" : "Subscribe"}
                  </button>
                </form>
              )}
            </div>

            {/* social icons */}
            <div className="flex gap-2 flex-wrap" aria-label="Social links">
              {[
                { key: "twitter",   href: "#",                              label: "Twitter" },
                { key: "linkedin",  href: "#",                              label: "LinkedIn" },
                { key: "instagram", href: "#",                              label: "Instagram" },
                { key: "youtube",   href: "#",                              label: "YouTube" },
                { key: "github",    href: "#",                              label: "GitHub" },
                { key: "mail",      href: "mailto:hello@linelessindia.in",  label: "Email" },
              ].map(s => (
                <a
                  key={s.key}
                  href={s.href}
                  aria-label={s.label}
                  className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-[#3a5270] hover:text-[#00d4aa] hover:border-[#00d4aa]/30 hover:bg-[#00d4aa]/08 transition-colors"
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  <Icon d={PATHS[s.key]} size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <nav aria-label="Quick links">
            <ColHead>Quick Links</ColHead>
            <div className="flex flex-col gap-2">
              {[
                { to: "/",              label: "Home" },
                { to: "/hospitals",     label: "Find Hospitals" },
                { to: "/token",         label: "My Token" },
                { to: "/how-it-works",  label: "How It Works" },
                { to: "/hospitals?nearby=true", label: "Near Me" },
                { to: "/feedback",      label: "Give Feedback" },
                { to: "/faq",           label: "FAQ" },
                { to: "/blog",          label: "Blog" },
              ].map(l => <FLink key={l.to} to={l.to}>{l.label}</FLink>)}
            </div>
          </nav>

          {/* ── Col 3: For Hospitals ── */}
          <nav aria-label="Hospital links">
            <ColHead>For Hospitals</ColHead>
            <div className="flex flex-col gap-2 mb-6">
              {[
                { to: "/admin",         label: "Admin Panel" },
                { to: "/admin/queues",  label: "Manage Queues" },
                { to: "/admin/reports", label: "Analytics" },
                { to: "/onboard",       label: "Onboard Your Hospital" },
                { to: "/api-docs",      label: "API Docs" },
                { to: "/partner",       label: "Partner With Us" },
              ].map(l => <FLink key={l.to} to={l.to}>{l.label}</FLink>)}
            </div>

            <ColHead>Contact</ColHead>
            <div className="flex flex-col gap-2.5">
              {[
                { icon: PATHS.mail,     text: "hello@linelessindia.in", href: "mailto:hello@linelessindia.in" },
                { icon: PATHS.phone,    text: "+91 98765 43210",         href: "tel:+919876543210" },
                { icon: PATHS.location, text: "Bengaluru, India",        href: null },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-white/[0.04] border border-white/[0.07] flex-shrink-0 mt-px text-[#3a5270]">
                    <Icon d={c.icon} size={10} />
                  </div>
                  {c.href ? (
                    <a href={c.href} className="text-[#3a5270] hover:text-[#00d4aa] text-xs transition-colors leading-relaxed">
                      {c.text}
                    </a>
                  ) : (
                    <span className="text-[#3a5270] text-xs leading-relaxed">{c.text}</span>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* ── Col 4: App + Certifications ── */}
          <div>
            <ColHead>Get the App</ColHead>
            <p className="text-[#3a5270] text-xs mb-3 leading-relaxed">
              Join queues instantly from your phone.
            </p>

            <div className="flex flex-col gap-2 mb-6">
              {[
                { icon: "🍎", sub: "Download on the", name: "App Store",    href: "#" },
                { icon: "▶",  sub: "Get it on",        name: "Google Play",  href: "#" },
              ].map(a => (
                <a
                  key={a.name}
                  href={a.href}
                  className="flex items-center gap-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-white/[0.12] rounded-lg px-3 py-2 transition-colors no-underline"
                  aria-label={`${a.sub} ${a.name}`}
                >
                  <span className="text-base leading-none flex-shrink-0" aria-hidden="true">{a.icon}</span>
                  <div>
                    <div className="text-[#3a5270] text-[9px] uppercase tracking-wider leading-none">{a.sub}</div>
                    <div className="text-[#8ba3c7] text-xs font-medium mt-0.5">{a.name}</div>
                  </div>
                </a>
              ))}
            </div>

            <ColHead>Certifications</ColHead>
            <div className="flex flex-col gap-2">
              {[
                "ISO 27001 — Info Security",
                "HIPAA — Health Data",
                "DPDP Act — Data Protection",
              ].map(c => (
                <div key={c} className="flex items-center gap-2 text-[#3a5270] text-xs">
                  <div className="w-4 h-4 rounded flex items-center justify-center bg-[#00d4aa]/08 border border-[#00d4aa]/15 flex-shrink-0">
                    <Icon d={PATHS.shield} size={9} />
                  </div>
                  {c}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ════════════════════════════════════════════════
          BOTTOM BAR
      ════════════════════════════════════════════════ */}
      <div className="border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">

          {/* copyright */}
          <p className="text-[#2a3f58] text-[11px] flex items-center gap-1.5 flex-wrap">
            <span>© {year} LineLess India.</span>
            <span className="text-[#1e3a5f]">·</span>
            <span>Made with</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#f87171" stroke="#f87171"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={PATHS.heart} />
            </svg>
            <span>for</span>
            <span className="text-[#fbbf24]">भारत 🇮🇳</span>
          </p>

          {/* legal links */}
          <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              { to: "/privacy",       label: "Privacy" },
              { to: "/terms",         label: "Terms" },
              { to: "/cookies",       label: "Cookies" },
              { to: "/sitemap",       label: "Sitemap" },
              { to: "/accessibility", label: "Accessibility" },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[#2a3f58] hover:text-[#4a6285] text-[11px] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* back to top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.08] flex items-center justify-center text-[#3a5270] hover:text-[#8ba3c7] transition-colors"
          >
            <Icon d={PATHS.chevup} size={12} />
          </button>

        </div>
      </div>

    </footer>
  );
}