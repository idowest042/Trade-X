import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom"; // Added this import
import {
  UserPlus,
  ShieldCheck,
  Wallet,
  TrendingUp,
  BarChart3,
  ArrowDownCircle,
  Lock,
  FileCheck,
  Shield,
  Activity,
} from "lucide-react";
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

// ─── Step Data ──────────────────────────────────────────────────────────────
const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create an Account",
    description:
      "Register on the TradeX platform by creating your secure investment account.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Complete Identity Verification (KYC)",
    description:
      "Verify your identity to ensure account security and compliance with financial regulations.",
  },
  {
    number: "03",
    icon: Wallet,
    title: "Deposit Funds",
    description:
      "Add funds to your account using supported cryptocurrency payment methods.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Choose an Investment Plan",
    description:
      "Select an investment plan that matches your goals and start participating in the market.",
  },
  {
    number: "05",
    icon: BarChart3,
    title: "Track Your Investment",
    description:
      "Monitor your investments, performance, and transaction history directly from your dashboard.",
  },
  {
    number: "06",
    icon: ArrowDownCircle,
    title: "Withdraw Earnings",
    description:
      "Request withdrawals anytime after verification and receive funds through your selected method.",
  },
];

// ─── Security Features ──────────────────────────────────────────────────────
const securityFeatures = [
  {
    icon: ShieldCheck,
    title: "Account Verification",
    description: "Multi-step KYC process to protect all users and ensure compliance.",
  },
  {
    icon: Lock,
    title: "Encrypted Transactions",
    description: "All transactions are secured with industry-standard encryption protocols.",
  },
  {
    icon: Shield,
    title: "Secure Infrastructure",
    description: "Platform built on secure, monitored infrastructure with regular audits.",
  },
  {
    icon: Activity,
    title: "Transparent Investment Tracking",
    description: "Real-time visibility into all your investments and transaction history.",
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function HowItWorks() {
  return (
    <>
      <Navbar />

      <main className="bg-white text-gray-900 antialiased">

        {/* ── 1. Hero ───────────────────────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 text-center">
            <FadeIn>
              <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                Getting Started
              </span>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
                How TradeX Works
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-xl md:text-2xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
                Start investing in a few simple steps and track your progress directly from your
                dashboard.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ── 2. Step-by-Step Process ───────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="text-center mb-10">
              <FadeIn>
                <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                  Simple Process
                </span>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
                  Get started in 6 easy steps
                </h2>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                  From account creation to your first withdrawal, here's exactly how it works.
                </p>
              </FadeIn>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <FadeIn key={step.number} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group relative bg-white border border-gray-200 rounded-2xl p-6 h-full 
                        hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Step number badge */}
                      <div className="absolute top-6 right-6">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full 
                          bg-blue-50 text-blue-600 text-sm font-bold group-hover:bg-blue-600 
                          group-hover:text-white transition-all duration-300">
                          {step.number}
                        </span>
                      </div>

                      {/* Icon */}
                      <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 
                        flex items-center justify-center mb-4 
                        group-hover:bg-blue-600 group-hover:text-white 
                        transition-all duration-300">
                        <Icon className="w-7 h-7" strokeWidth={1.75} />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 tracking-tight pr-12">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 3. Platform Security ──────────────────────────────────────── */}
        <section className="border-b border-gray-200 bg-gray-50/40">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">

              {/* Left — Text */}
              <div>
                <FadeIn>
                  <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                    Platform Security
                  </span>
                </FadeIn>
                <FadeIn delay={0.06}>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                    Your security is our priority
                  </h2>
                </FadeIn>
                <FadeIn delay={0.12}>
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                    TradeX prioritizes platform security, user verification, and transaction
                    transparency to maintain a safe investment environment for all users.
                  </p>
                </FadeIn>

                {/* Security points */}
                <div className="space-y-4">
                  {securityFeatures.map((feature, i) => {
                    const Icon = feature.icon;
                    return (
                      <FadeIn key={feature.title} delay={0.18 + i * 0.06}>
                        <div className="flex gap-4 items-start group">
                          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 
                            flex items-center justify-center flex-shrink-0
                            group-hover:bg-blue-600 group-hover:text-white 
                            transition-all duration-200">
                            <Icon className="w-5 h-5" strokeWidth={1.75} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </FadeIn>
                    );
                  })}
                </div>
              </div>

              {/* Right — Visual Block */}
              <FadeIn delay={0.1} className="lg:order-last">
                <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-8 min-h-[400px]">
                  {/* Decorative grid */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="security-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#BFDBFE" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#security-grid)" />
                    </svg>
                  </div>

                  {/* Security badge */}
                  <div className="relative z-10">
                    <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Security Status</p>
                          <p className="text-xs text-gray-500">All systems operational</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-600">Encryption</span>
                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-600">KYC Verification</span>
                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-600">Platform Monitoring</span>
                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          24/7
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Uptime", value: "99.9%" },
                        { label: "Users Protected", value: "12K+" },
                        { label: "Secure Transactions", value: "50K+" },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl border border-blue-100 p-4 text-center">
                          <p className="text-xl font-bold text-blue-600">{stat.value}</p>
                          <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accent elements */}
                  <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-blue-200/30 blur-2xl"></div>
                  <div className="absolute bottom-10 left-6 w-16 h-16 rounded-full bg-blue-300/20 blur-xl"></div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ── 4. Quick CTA ──────────────────────────────────────────────── */}
        <section className="bg-blue-50">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                  Ready to get started?
                </h2>
              </FadeIn>
              <FadeIn delay={0.08}>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                  Getting started with TradeX takes only a few minutes.
                </p>
              </FadeIn>
              <FadeIn delay={0.16}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <button className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white 
                      text-sm font-semibold px-7 py-3.5 rounded-xl hover:bg-blue-700 
                      active:scale-95 transition-all duration-200 tracking-wide shadow-md hover:shadow-lg">
                      Create Account
                    </button>
                  </Link>
                  <Link to="/pricing">
                    <button className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 
                      border border-blue-200 text-sm font-semibold px-7 py-3.5 rounded-xl 
                      hover:bg-blue-50 hover:border-blue-300 active:scale-95 
                      transition-all duration-200 tracking-wide shadow-sm hover:shadow-md">
                      View Investment Plans
                    </button>
                  </Link>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}