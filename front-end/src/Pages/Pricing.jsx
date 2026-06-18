import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Calculator,
  DollarSign,
  Target,
  Activity,
  Lock,
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

// ─── Investment Plans Data ─────────────────────────────────────────────────
const plans = [
  {
    name: "Starter Plan",
    badge: null,
    minDeposit: "$100",
    depositValue: 100,
    returnRate: "5% Weekly",
    returnValue: 5,
    duration: "30 Days",
    features: ["24/7 Support", "Secure Trading", "Instant Withdrawals"],
    highlighted: false,
  },
  {
    name: "Growth Plan",
    badge: "Popular",
    minDeposit: "$500",
    depositValue: 500,
    returnRate: "8% Weekly",
    returnValue: 8,
    duration: "30 Days",
    features: ["24/7 Support", "Secure Trading", "Instant Withdrawals", "Priority Processing"],
    highlighted: true,
  },
  {
    name: "Professional Plan",
    badge: null,
    minDeposit: "$2,000",
    depositValue: 2000,
    returnRate: "12% Weekly",
    returnValue: 12,
    duration: "30 Days",
    features: ["24/7 Support", "Secure Trading", "Instant Withdrawals", "Priority Processing", "Personal Account Manager"],
    highlighted: false,
  },
  {
    name: "Elite Plan",
    badge: "Premium",
    minDeposit: "$10,000",
    depositValue: 10000,
    returnRate: "18% Weekly",
    returnValue: 18,
    duration: "30 Days",
    features: ["24/7 Support", "Secure Trading", "Instant Withdrawals", "Priority Processing", "Personal Account Manager", "Exclusive Market Insights"],
    highlighted: false,
  },
];

// ─── Why Choose Features ───────────────────────────────────────────────────
const features = [
  {
    icon: Shield,
    title: "Secure Investments",
    description: "Bank-grade encryption and secure wallet infrastructure protect your funds.",
  },
  {
    icon: Activity,
    title: "Advanced Trading Algorithms",
    description: "AI-powered strategies optimize returns across market conditions.",
  },
  {
    icon: TrendingUp,
    title: "Transparent Profits",
    description: "Track every transaction and profit in real-time from your dashboard.",
  },
  {
    icon: Zap,
    title: "Fast Withdrawals",
    description: "Request and receive your earnings within 24-48 hours.",
  },
  {
    icon: BarChart3,
    title: "Real-time Tracking",
    description: "Monitor portfolio performance and investment growth live.",
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Pricing() {
  const [calculatorAmount, setCalculatorAmount] = useState(500);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(1); // Growth Plan default

  const selectedPlan = plans[selectedPlanIndex];
  const weeklyProfit = (calculatorAmount * selectedPlan.returnValue) / 100;
  const monthlyProfit = weeklyProfit * 4;

  return (
    <>
      <Navbar />

      <main className="bg-white text-gray-900 antialiased">

      

        {/* ── 2. Investment Plans ───────────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="text-center mb-10">
              <FadeIn>
                <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                  Investment Options
                </span>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
                  Choose Your Investment Plan
                </h2>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                  Transparent pricing. Predictable returns. No hidden fees.
                </p>
              </FadeIn>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan, i) => (
                <FadeIn key={plan.name} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    className={`relative bg-white rounded-2xl p-6 h-full flex flex-col
                      ${plan.highlighted 
                        ? 'border-2 border-blue-600 shadow-xl' 
                        : 'border border-gray-200 shadow-md hover:shadow-xl'
                      } transition-all duration-300`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center mt-2">
                      {plan.name}
                    </h3>

                    {/* Min Deposit */}
                    <div className="text-center mb-6 pb-6 border-b border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Minimum Investment</p>
                      <p className="text-4xl font-bold text-blue-600">{plan.minDeposit}</p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expected Returns</span>
                        <span className="text-sm font-bold text-gray-900">{plan.returnRate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Investment Duration</span>
                        <span className="text-sm font-bold text-gray-900">{plan.duration}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2.5">
                          <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" strokeWidth={2.5} />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Invest Button */}
                    <button className={`w-full py-3.5 rounded-xl font-semibold text-sm
                      transition-all duration-200 active:scale-95
                      ${plan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      Invest Now
                    </button>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Investment Calculator ──────────────────────────────────── */}
        <section className="border-b border-gray-200 bg-gray-50/40">
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
            <div className="text-center mb-10">
              <FadeIn>
                <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                  Calculate Your Returns
                </span>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
                  Investment Calculator
                </h2>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="text-lg md:text-xl text-gray-600">
                  See your potential earnings before you invest.
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={0.16}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Investment Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={calculatorAmount}
                        onChange={(e) => setCalculatorAmount(Number(e.target.value) || 0)}
                        min="100"
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          text-lg font-semibold"
                      />
                    </div>
                  </div>

                  {/* Plan Select */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Plan
                    </label>
                    <select
                      value={selectedPlanIndex}
                      onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
                      className="w-full px-4 py-3.5 border border-gray-300 rounded-xl 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        text-lg font-semibold cursor-pointer"
                    >
                      {plans.map((plan, idx) => (
                        <option key={plan.name} value={idx}>
                          {plan.name} - {plan.returnRate}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-6">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Estimated Returns</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Weekly Profit</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${weeklyProfit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Monthly Profit</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${monthlyProfit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total After 30 Days</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(calculatorAmount + monthlyProfit).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    * Estimated returns based on {selectedPlan.name}. Actual returns may vary based on market conditions.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── 4. Why Choose Our Plans ───────────────────────────────────── */}
        <section className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="text-center mb-10">
              <FadeIn>
                <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
                  Platform Benefits
                </span>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Why Choose Our Plans
                </h2>
              </FadeIn>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <FadeIn key={feature.title} delay={i * 0.08}>
                    <div className="group bg-white border border-gray-200 rounded-2xl p-6 
                      hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 
                        flex items-center justify-center mb-4
                        group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <Icon className="w-6 h-6" strokeWidth={1.75} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-base text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 5. Final CTA ──────────────────────────────────────────────── */}
        <section className="bg-blue-50">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
                  Start Investing With Confidence
                </h2>
              </FadeIn>
              <FadeIn delay={0.08}>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                  Join thousands of investors already earning consistent returns with TradeX.
                </p>
              </FadeIn>
              <FadeIn delay={0.16}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white 
                    text-sm font-semibold px-7 py-3.5 rounded-xl hover:bg-blue-700 
                    active:scale-95 transition-all duration-200 tracking-wide shadow-md hover:shadow-lg">
                    Invest Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 
                    border border-blue-200 text-sm font-semibold px-7 py-3.5 rounded-xl 
                    hover:bg-blue-50 hover:border-blue-300 active:scale-95 
                    transition-all duration-200 tracking-wide shadow-sm hover:shadow-md">
                    Contact Support
                  </button>
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