import { useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Added this import
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"

// ─── Lucide-style inline SVG icons (no extra package needed) ──────────────
const IconCandlestickChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M9 5v4" /><rect x="7" y="9" width="4" height="6" rx="1" />
    <path d="M9 15v4" /><path d="M15 3v4" />
    <rect x="13" y="7" width="4" height="8" rx="1" /><path d="M15 15v4" />
  </svg>
);

const IconBitcoin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
  </svg>
);

const IconPieChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const IconDatabase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
  </svg>
);

const IconShieldCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconFileText = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── Scroll-reveal hook ────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || "0";
            setTimeout(() => {
              el.classList.remove("opacity-0", "translate-y-6");
              el.classList.add("opacity-100", "translate-y-0");
            }, Number(delay));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "-60px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Reveal wrapper ────────────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, className = "" }) => (
  <div
    data-reveal
    data-delay={delay}
    className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}
  >
    {children}
  </div>
);

// ─── Value proposition rows ─────────────────────────────────────────────────
const valuePoints = [
  {
    icon: <IconDatabase />,
    label: "Data-Driven Decision Making",
    detail:
      "Every strategy is informed by market data, pattern analysis, and real-time execution logic.",
  },
  {
    icon: <IconShieldCheck />,
    label: "Risk Management Frameworks",
    detail:
      "Position sizing, stop-loss protocols, and drawdown controls are embedded into every strategy.",
  },
  {
    icon: <IconFileText />,
    label: "Transparent Reporting",
    detail:
      "Users receive clear, consistent reporting on portfolio performance and allocation activity.",
  },
  {
    icon: <IconLock />,
    label: "Secure Infrastructure",
    detail:
      "Platform architecture is built around data security, access controls, and operational continuity.",
  },
];

// ─── Service cards ──────────────────────────────────────────────────────────
const services = [
  {
    icon: <IconCandlestickChart />,
    tag: "01",
    title: "Forex Market Access",
    description:
      "Gain exposure to major and minor currency pairs through professionally managed trading strategies designed to adapt to market conditions.",
  },
  {
    icon: <IconBitcoin />,
    tag: "02",
    title: "Cryptocurrency Investments",
    description:
      "Participate in digital asset markets through price-based trading without direct asset custody, supported by transparent execution.",
  },
  {
    icon: <IconPieChart />,
    tag: "03",
    title: "Portfolio Diversification",
    description:
      "Reduce risk through diversified investment approaches combining forex, crypto, and structured strategies.",
  },
];

// ─── Structured visual block (right column) ────────────────────────────────
const StructuredVisual = () => (
  <div className="w-full rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
    {/* Header bar */}
    <div className="bg-gray-900 px-5 py-3 flex items-center justify-between">
      <span className="text-xs font-mono text-gray-400 tracking-widest uppercase">
        Portfolio Overview
      </span>
      <div className="flex gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
        <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
      </div>
    </div>

    {/* Rows */}
    <div className="divide-y divide-gray-100">
      {[
        { label: "Forex Allocation", pct: 48, color: "bg-blue-600" },
        { label: "Crypto Exposure", pct: 32, color: "bg-blue-400" },
        { label: "Structured Assets", pct: 20, color: "bg-blue-200" },
      ].map(({ label, pct, color }) => (
        <div key={label} className="px-5 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-700">{label}</span>
            <span className="text-xs font-mono text-gray-500">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>

    {/* Footer metrics */}
    <div className="bg-gray-50 px-5 py-4 grid grid-cols-3 divide-x divide-gray-200 border-t border-gray-100">
      {[
        { label: "Markets", value: "40+" },
        { label: "Strategies", value: "12" },
        { label: "Uptime", value: "99.9%" },
      ].map(({ label, value }) => (
        <div key={label} className="text-center px-2">
          <p className="text-base font-bold text-gray-900 font-mono">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function WhatWeDo() {
  useReveal();

  return (
    <>
      <Navbar />

      <main className="bg-white text-gray-900 antialiased">

        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-14">

            {/* Eyebrow rule */}
            <Reveal>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-10 bg-blue-600" />
                <span className="text-2xl font-mono tracking-[0.2em] uppercase text-blue-600">
                  Services &amp; Capabilities
                </span>
              </div>
            </Reveal>

            <div className="max-w-3xl">
              <Reveal delay={80}>
                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.06] tracking-tight text-gray-950 mb-6"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                  What We Do
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-light max-w-2xl">
                  Providing structured access to global forex and cryptocurrency markets through
                  disciplined investment strategies.
                </p>
              </Reveal>
            </div>

            {/* Bottom rule line */}
            <Reveal delay={240}>
              <div className="mt-12 flex items-center gap-8">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-xs font-mono text-gray-400 tracking-widest whitespace-nowrap">
                  TRX · PLATFORM
                </span>
                <div className="h-px w-12 bg-gray-100" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── 2. Overview ───────────────────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

              {/* Label column */}
              <Reveal className="lg:col-span-3">
                <p className="text-xs font-mono tracking-[0.18em] uppercase text-blue-600 pt-1">
                  Overview
                </p>
              </Reveal>

              {/* Content column */}
              <div className="lg:col-span-9">
                <Reveal delay={80}>
                  <p className="text-xl md:text-2xl text-gray-800 leading-[1.75] font-light mb-5 border-l-2 border-blue-600 pl-6">
                    TradeX offers investment solutions designed to help individuals and institutions
                    participate in global financial markets.
                  </p>
                </Reveal>
                <Reveal delay={160}>
                  <p className="text-base text-gray-600 leading-[1.85] pl-6 border-l-2 border-gray-100">
                    Our services focus on forex trading, cryptocurrency exposure, and portfolio
                    diversification, supported by risk management and compliance-driven operations.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Core Services ──────────────────────────────────────────── */}
        <section className="border-b border-gray-200 bg-gray-50/40">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">

            {/* Section label */}
            <Reveal>
              <div className="flex items-center gap-4 mb-12">
                <div className="h-px w-10 bg-blue-600" />
                <span className="text-xs font-mono tracking-[0.2em] uppercase text-blue-600">
                  Core Services
                </span>
              </div>
            </Reveal>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map(({ icon, tag, title, description }, i) => (
                <Reveal key={title} delay={i * 100}>
                  <article className="group bg-white border border-gray-200 rounded-2xl p-7 h-full flex flex-col
                    hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-default">

                    {/* Card top row */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center
                        group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        {icon}
                      </div>
                      <span className="text-xs font-mono text-gray-300 group-hover:text-blue-300 transition-colors duration-300 tracking-wider pt-1">
                        {tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-lg font-bold text-gray-900 mb-3 tracking-tight leading-snug"
                      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    >
                      {title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed flex-1">
                      {description}
                    </p>

                    {/* Bottom rule */}
                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-400 group-hover:text-blue-600 transition-colors duration-300">
                      <span>Learn more</span>
                      <IconArrowRight />
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. How We Add Value ───────────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-20 items-start">

              {/* Left — Text */}
              <div>
                <Reveal>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="h-px w-10 bg-blue-600" />
                    <span className="text-xs font-mono tracking-[0.2em] uppercase text-blue-600">
                      How We Add Value
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={80}>
                  <h2
                    className="text-3xl md:text-4xl font-bold text-gray-950 tracking-tight leading-snug mb-8"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  >
                    The principles behind every decision we make
                  </h2>
                </Reveal>

                {/* Value point rows */}
                <div className="space-y-0 divide-y divide-gray-100">
                  {valuePoints.map(({ icon, label, detail }, i) => (
                    <Reveal key={label} delay={i * 80 + 120}>
                      <div className="py-5 flex gap-4 group">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5
                          group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                          {icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
                          <p className="text-sm text-gray-500 leading-relaxed">{detail}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* Right — Structured visual */}
              <Reveal delay={160} className="lg:sticky lg:top-24">
                <StructuredVisual />

                {/* Caption */}
                <p className="text-xs text-gray-400 text-center mt-4 font-mono tracking-wide">
                  Illustrative allocation model — not indicative of guaranteed returns
                </p>
              </Reveal>

            </div>
          </div>
        </section>

        {/* ── 5. Closing Trust Section ──────────────────────────────────── */}
        <section className="bg-blue-50">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
            <div className="max-w-2xl mx-auto text-center">

              <Reveal>
                <div className="flex items-center justify-center gap-4 mb-7">
                  <div className="h-px w-10 bg-blue-300" />
                  <span className="text-xs font-mono tracking-[0.2em] uppercase text-blue-500">
                    Our Commitment
                  </span>
                  <div className="h-px w-10 bg-blue-300" />
                </div>
              </Reveal>

              <Reveal delay={80}>
                <h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-snug mb-5"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                  Built for the long term.
                </h2>
              </Reveal>

              <Reveal delay={160}>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
                  TradeX operates with a long-term vision, prioritizing responsible investing,
                  platform security, and user trust.
                </p>
              </Reveal>

              <Reveal delay={220}>
                <Link to="/how-it-works">
                  <button className="inline-flex items-center gap-2.5 bg-blue-600 text-white text-sm font-semibold
                    px-7 py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-200 tracking-wide">
                    Learn How It Works
                    <IconArrowRight />
                  </button>
                </Link>
              </Reveal>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}