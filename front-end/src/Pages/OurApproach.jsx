import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom"; // Added this import
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

// ─── Lucide-style SVG Icons ────────────────────────────────────────────────
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconTrendingUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const IconTarget = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconCheckCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconBarChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const IconArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

// ─── Abstract Visual (Philosophy section) ──────────────────────────────────
const AbstractVisual = () => (
  <div className="relative w-full h-full min-h-[360px] bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 overflow-hidden p-8">
    {/* Grid pattern */}
    <div className="absolute inset-0 opacity-30">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#BFDBFE" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>

    {/* Floating cards */}
    <div className="relative z-10 space-y-4">
      <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm ml-0 max-w-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <IconTrendingUp />
          </div>
          <div className="h-2 w-24 bg-blue-100 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-gray-100 rounded-full" />
          <div className="h-2 w-4/5 bg-gray-100 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm ml-12 max-w-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <IconShield />
          </div>
          <div className="h-2 w-20 bg-blue-100 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-gray-100 rounded-full" />
          <div className="h-2 w-3/4 bg-gray-100 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm ml-6 max-w-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-400 flex items-center justify-center">
            <IconEye />
          </div>
          <div className="h-2 w-28 bg-blue-100 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-gray-100 rounded-full" />
          <div className="h-2 w-5/6 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>

    {/* Accent circles */}
    <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-blue-200/30 blur-xl" />
    <div className="absolute bottom-8 right-12 w-24 h-24 rounded-full bg-blue-300/20 blur-2xl" />
  </div>
);

// ─── Core Principles Data ──────────────────────────────────────────────────
const principles = [
  {
    icon: <IconShield />,
    title: "Risk Management",
    description: "Every strategy is evaluated with strict risk controls to protect user capital.",
  },
  {
    icon: <IconTrendingUp />,
    title: "Market Analysis",
    description: "Our decisions are guided by data, technical indicators, and macroeconomic trends.",
  },
  {
    icon: <IconEye />,
    title: "Transparency",
    description: "Users have clear insight into their investments, balances, and transaction history.",
  },
  {
    icon: <IconLock />,
    title: "Security First",
    description: "Platform infrastructure is built to prioritize user safety and data protection.",
  },
];

// ─── Operational Steps ──────────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    icon: <IconSearch />,
    title: "Market Monitoring & Analysis",
    description: "Continuous tracking of market conditions, price movements, and trend identification.",
  },
  {
    number: "02",
    icon: <IconTarget />,
    title: "Strategy Planning & Allocation",
    description: "Structured allocation decisions based on market analysis and risk parameters.",
  },
  {
    number: "03",
    icon: <IconCheckCircle />,
    title: "Risk Assessment & Execution",
    description: "Every trade is evaluated against risk thresholds before execution.",
  },
  {
    number: "04",
    icon: <IconBarChart />,
    title: "Performance Tracking",
    description: "Real-time monitoring of portfolio performance and position management.",
  },
  {
    number: "05",
    icon: <IconRefresh />,
    title: "Continuous Optimization",
    description: "Regular review and adjustment of strategies based on changing market dynamics.",
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function OurApproach() {
  return (
    <>
      <Navbar />

      <main className="bg-white text-gray-900 antialiased">

        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 text-center">
            <FadeIn>
              <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                Investment Philosophy
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
                Our Approach
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
                At TradeX, we follow a disciplined investment framework focused on transparency,
                risk management, and long-term growth.
              </p>
            </FadeIn>
            <FadeIn delay={0.22}>
              <div className="mt-6 flex items-center justify-center gap-6">
                <div className="h-px w-16 bg-gray-200" />
                <span className="text-xs tracking-widest uppercase text-gray-400 font-medium">
                  Strategy · Framework · Execution
                </span>
                <div className="h-px w-16 bg-gray-200" />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── 2. Philosophy ─────────────────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

              {/* Left — Text */}
              <div>
                <FadeIn>
                  <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                    Investment Philosophy
                  </span>
                </FadeIn>
                <FadeIn delay={0.06}>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                    Built on research, analysis, and disciplined execution
                  </h2>
                </FadeIn>
                <FadeIn delay={0.12}>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-4">
                    Our investment approach is built on research, market analysis, and structured
                    risk management.
                  </p>
                </FadeIn>
                <FadeIn delay={0.18}>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                    Instead of chasing short-term market hype, TradeX focuses on sustainable
                    strategies designed to perform across different market conditions.
                  </p>
                </FadeIn>

                {/* Stat badges */}
                <FadeIn delay={0.22}>
                  <div className="mt-6 flex flex-wrap gap-6 pt-4 border-t border-gray-100">
                    {[
                      { label: "Risk Controls", value: "5-Tier" },
                      { label: "Markets Tracked", value: "40+" },
                      { label: "Strategy Types", value: "12" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-2xl font-bold text-blue-600 tracking-tight">{value}</p>
                        <p className="text-xs text-gray-500 mt-1 tracking-wide uppercase">{label}</p>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>

              {/* Right — Visual */}
              <FadeIn delay={0.1} className="lg:order-last">
                <AbstractVisual />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── 3. Core Principles ────────────────────────────────────────── */}
        <section className="border-b border-gray-200 bg-gray-50/40">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="text-center mb-10">
              <FadeIn>
                <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                  Core Principles
                </span>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  The foundation of our operations
                </h2>
              </FadeIn>
            </div>

            {/* Principles grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {principles.map(({ icon, title, description }, i) => (
                <FadeIn key={title} delay={i * 0.08}>
                  <div className="group bg-white border border-gray-200 rounded-2xl p-6 h-full 
                    hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 
                    transition-all duration-300 cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 
                      flex items-center justify-center mb-4
                      group-hover:bg-blue-600 group-hover:text-white 
                      transition-all duration-300">
                      {icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                      {title}
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. How TradeX Operates ────────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="text-center mb-10">
              <FadeIn>
                <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                  Operational Workflow
                </span>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  How TradeX Operates
                </h2>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mt-4">
                  A step-by-step process that governs every investment decision.
                </p>
              </FadeIn>
            </div>

            {/* Timeline */}
            <div className="relative max-w-4xl mx-auto">
              {/* Vertical line (hidden on mobile) */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200" />

              {/* Steps */}
              <div className="space-y-8">
                {steps.map(({ number, icon, title, description }, i) => {
                  const isEven = i % 2 === 0;
                  return (
                    <FadeIn key={number} delay={i * 0.1}>
                      <div className={`relative flex items-center gap-8 ${
                        isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                      } flex-col md:gap-16`}>
                        
                        {/* Left or Right content */}
                        <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'} text-left`}>
                          <div className={`inline-block ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}>
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-sm font-mono text-blue-400 font-semibold tracking-wider">
                                {number}
                              </span>
                              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                {icon}
                              </div>
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                              {title}
                            </h3>
                            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-sm">
                              {description}
                            </p>
                          </div>
                        </div>

                        {/* Center dot */}
                        <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-md z-10" />

                        {/* Spacer for alternating layout */}
                        <div className="flex-1 hidden md:block" />
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Long-Term Focus ────────────────────────────────────────── */}
        <section className="bg-blue-50">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <FadeIn>
                <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                  Our Commitment
                </span>
              </FadeIn>
              <FadeIn delay={0.08}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                  Built for the long term
                </h2>
              </FadeIn>
              <FadeIn delay={0.16}>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                  TradeX is designed with a long-term perspective. Our focus is not short bursts of
                  profit, but sustainable investment opportunities supported by structured strategies
                  and responsible operations.
                </p>
              </FadeIn>
              <FadeIn delay={0.22}>
                <Link to="/pricing">
                  <button className="inline-flex items-center gap-2.5 bg-blue-600 text-white text-sm font-semibold 
                    px-7 py-3.5 rounded-xl hover:bg-blue-700 active:scale-95 
                    transition-all duration-200 tracking-wide shadow-md hover:shadow-lg">
                    View Investment Plans
                    <IconArrowRight />
                  </button>
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}