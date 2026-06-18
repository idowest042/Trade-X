import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"

// ─── Reusable fade-in wrapper ──────────────────────────────────────────────
const FadeIn = ({ children, delay = 0, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ─── SVG Icons ─────────────────────────────────────────────────────────────
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconTrendingUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// ─── Abstract SVG Illustration (right column) ──────────────────────────────
const AbstractIllustration = () => (
  <svg
    viewBox="0 0 420 340"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full max-h-[340px]"
  >
    {/* Grid lines */}
    {[0, 60, 120, 180, 240, 300].map((x) => (
      <line key={`vg-${x}`} x1={x + 20} y1="20" x2={x + 20} y2="320"
        stroke="#DBEAFE" strokeWidth="1" />
    ))}
    {[0, 60, 120, 180, 240, 280].map((y) => (
      <line key={`hg-${y}`} x1="20" y1={y + 20} x2="400" y2={y + 20}
        stroke="#DBEAFE" strokeWidth="1" />
    ))}

    {/* Chart area fill */}
    <path
      d="M40 260 L100 210 L160 230 L220 160 L280 140 L340 90 L380 70 L380 300 L40 300 Z"
      fill="#EFF6FF"
    />

    {/* Chart line */}
    <path
      d="M40 260 L100 210 L160 230 L220 160 L280 140 L340 90 L380 70"
      stroke="#2563EB"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Data points */}
    {[
      [40, 260], [100, 210], [160, 230],
      [220, 160], [280, 140], [340, 90], [380, 70]
    ].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="5" fill="#2563EB" stroke="white" strokeWidth="2" />
    ))}

    {/* Bar chart at bottom */}
    {[
      [55, 40, 280], [115, 60, 260], [175, 35, 285],
      [235, 80, 240], [295, 55, 265], [355, 90, 230]
    ].map(([x, h, y], i) => (
      <rect key={`bar-${i}`} x={x - 12} y={y} width="24" height={h}
        fill={i === 5 ? "#2563EB" : "#BFDBFE"} rx="2" />
    ))}

    {/* Floating stat card */}
    <rect x="270" y="32" width="130" height="52" rx="8"
      fill="white" stroke="#DBEAFE" strokeWidth="1.5"
      style={{ filter: "drop-shadow(0 2px 8px rgba(37,99,235,0.10))" }} />
    <rect x="282" y="44" width="12" height="12" rx="3" fill="#2563EB" />
    <rect x="302" y="46" width="50" height="5" rx="2.5" fill="#93C5FD" />
    <rect x="302" y="56" width="36" height="5" rx="2.5" fill="#DBEAFE" />
    <rect x="366" y="42" width="24" height="12" rx="3" fill="#DCFCE7" />
    <rect x="369" y="45.5" width="18" height="5" rx="2" fill="#16A34A" />

    {/* Small accent dot */}
    <circle cx="380" cy="32" r="10" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
    <circle cx="380" cy="32" r="4" fill="#2563EB" />
  </svg>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AboutUs() {
  const values = [
    {
      icon: <IconEye />,
      title: "Transparency",
      body: "We believe in clear processes, open communication, and honest reporting — always.",
    },
    {
      icon: <IconShield />,
      title: "Security",
      body: "User funds and data protection are at the core of everything we build.",
    },
    {
      icon: <IconTrendingUp />,
      title: "Growth",
      body: "We focus on sustainable, long-term growth over short-term gains.",
    },
  ];

  return (
    <>
    <Navbar />
    <div className="bg-white font-sans text-gray-900 antialiased">

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <FadeIn>
            <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-6">
              Who We Are
            </span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight mb-6"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              About TradeX
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
              A modern investment platform focused on transparency, security, and long-term growth.
            </p>
          </FadeIn>
          <FadeIn delay={0.22}>
            <div className="mt-10 flex items-center justify-center gap-6">
              <div className="h-px w-16 bg-gray-200" />
              <span className="text-xs tracking-widest uppercase text-gray-400 font-medium">
                Est. 2021
              </span>
              <div className="h-px w-16 bg-gray-200" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 2. Company Overview ─────────────────────────────────────────── */}
      <section className=" border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — Text */}
            <div>
              <FadeIn>
                <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-5">
                  Our Story
                </span>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-6 tracking-tight"
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                >
                  Built for the future of digital investing
                </h2>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="text-gray-600 text-base leading-[1.85] mb-5">
                  TradeX is a digital investment platform providing access to forex and
                  cryptocurrency markets through structured investment solutions.
                </p>
              </FadeIn>
              <FadeIn delay={0.18}>
                <p className="text-gray-600 text-base leading-[1.85] mb-10">
                  We combine technology, professional trading strategies, and strict risk management
                  to help users participate in global financial markets with confidence.
                </p>
              </FadeIn>

              {/* Stat strip */}
              <FadeIn delay={0.22}>
                <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-100">
                  {[
                    { label: "Active Users", value: "12,000+" },
                    { label: "Markets Covered", value: "40+" },
                    { label: "Uptime SLA", value: "99.9%" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-2xl font-bold text-blue-600 tracking-tight">{value}</p>
                      <p className="text-xs text-gray-500 mt-0.5 tracking-wide uppercase">{label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Right — Abstract Illustration */}
            <FadeIn delay={0.1} className="flex items-center justify-center">
              <div className="w-full max-w-[480px] bg-gray-50 rounded-2xl border border-gray-100 p-8">
                <AbstractIllustration />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 3. Mission & Vision ─────────────────────────────────────────── */}
      <section className="py-20 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
              Direction
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Mission & Vision
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission */}
            <FadeIn delay={0.06}>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full hover:border-blue-200 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                    <IconTarget />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Mission</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-base">
                  To provide a secure, transparent, and accessible investment platform that empowers
                  users to grow their wealth responsibly.
                </p>
                <div className="mt-6 h-0.5 w-12 bg-blue-600 rounded-full" />
              </div>
            </FadeIn>

            {/* Vision */}
            <FadeIn delay={0.12}>
              <div className="bg-blue-600 border border-blue-600 rounded-2xl p-8 h-full hover:bg-blue-700 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center flex-shrink-0">
                    <IconGlobe />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Vision</h3>
                </div>
                <p className="text-blue-100 leading-relaxed text-base">
                  To become a trusted global investment platform recognized for integrity,
                  innovation, and user-focused solutions.
                </p>
                <div className="mt-6 h-0.5 w-12 bg-white/40 rounded-full" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 4. Core Values ─────────────────────────────────────────────── */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
              Principles
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Core Values
            </h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(({ icon, title, body }, i) => (
              <FadeIn key={title} delay={0.06 * (i + 1)}>
                <div className="group bg-white border border-gray-200 rounded-2xl p-8 h-full hover:border-blue-200 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    {icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Closing CTA ─────────────────────────────────────────────── */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-5">
                Our Commitment
              </span>
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-5 tracking-tight"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              >
                Built for trust. Designed for the long term.
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                TradeX is built with a long-term vision, prioritizing trust, compliance, and user
                experience at every step.
              </p>
              <button
                className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-7 py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-200 tracking-wide"
              >
                Explore Investment Plans
                <svg
                  viewBox="0 0 20 20" fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
    <Footer />
    </>
  );
}