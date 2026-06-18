import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, MessageCircle, ShieldCheck, Wallet, TrendingUp, User } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const faqCategories = [
  {
    id: "general",
    label: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "What is TradeX?",
        a: "TradeX is a digital platform that allows users to trade and invest in cryptocurrencies and forex markets. Built for accessibility and performance, it brings professional-grade tools to every investor.",
      },
      {
        q: "Do I need experience to get started?",
        a: "No. TradeX provides tools and guidance suitable for both beginners and experienced users. Our intuitive interface and learning resources make it easy to start your trading journey at any skill level.",
      },
    ],
  },
  {
    id: "account",
    label: "Account & Verification",
    icon: User,
    questions: [
      {
        q: "Do I need to complete KYC?",
        a: "Yes. Identity verification is required to enable withdrawals and ensure platform security. KYC helps us maintain a safe and compliant trading environment for all users.",
      },
      {
        q: "How long does verification take?",
        a: "Verification is typically completed within a short timeframe after submitting valid documents. Our team reviews submissions promptly to get you trading as quickly as possible.",
      },
    ],
  },
  {
    id: "deposits",
    label: "Deposits & Withdrawals",
    icon: Wallet,
    questions: [
      {
        q: "How can I deposit funds?",
        a: "You can deposit using supported cryptocurrencies such as USDT, Bitcoin, and Ethereum. Our deposit process is seamless and typically reflects in your account shortly after network confirmation.",
      },
      {
        q: "How long do withdrawals take?",
        a: "Withdrawals are processed quickly after approval, depending on network conditions. We prioritize timely processing so your funds reach you without unnecessary delays.",
      },
    ],
  },
  {
    id: "trading",
    label: "Trading & Investments",
    icon: TrendingUp,
    questions: [
      {
        q: "Can I both trade and invest on TradeX?",
        a: "Yes. TradeX supports active trading as well as structured investment plans. Whether you prefer short-term trades or long-term growth strategies, we have options tailored to your goals.",
      },
      {
        q: "Are profits guaranteed?",
        a: "No. Trading and investing involve risk, and returns are not guaranteed. TradeX provides tools and market data to help you make informed decisions, but all trading carries inherent risk.",
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: ShieldCheck,
    questions: [
      {
        q: "Is my money safe?",
        a: "TradeX uses secure systems and verification processes to protect user accounts and transactions. We employ industry-standard security protocols and continuous monitoring to safeguard your assets.",
      },
      {
        q: "How is my data protected?",
        a: "User data is handled with strict privacy and security measures. We adhere to data protection best practices and never share your personal information with unauthorized third parties.",
      },
    ],
  },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? "border-blue-400 shadow-md shadow-blue-100"
          : "border-slate-200 hover:border-blue-200"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-blue-50/40 transition-colors duration-200"
      >
        <span
          className={`font-semibold text-base leading-snug transition-colors ${
            isOpen ? "text-blue-700" : "text-slate-800"
          }`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {isOpen ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="px-6 pb-5 pt-1 bg-blue-50/30 border-t border-blue-100">
              <p
                className="text-slate-600 text-sm leading-relaxed"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openIndex, setOpenIndex] = useState(null);

  const currentCategory = faqCategories.find((c) => c.id === activeCategory);

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setOpenIndex(null);
  };

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      <Navbar />

      <main className="bg-white min-h-screen">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 pt-24 pb-20 px-6">
          {/* decorative blobs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-56 h-56 bg-blue-800/30 rounded-full blur-3xl pointer-events-none" />
          {/* dot-grid overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <HelpCircle size={13} />
              Help Center
            </div>
            <h1
              className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Frequently Asked{" "}
              <span className="text-blue-200">Questions</span>
            </h1>
            <p
              className="text-blue-100 text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Find answers to common questions about trading, investing, and
              using TradeX.
            </p>
          </motion.div>
        </section>

        {/* ── FAQ Body ─────────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12"
          >
            {faqCategories.map((cat) => {
              const Icon = cat.icon;
              const isActive = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Icon size={15} />
                  {cat.label}
                </button>
              );
            })}
          </motion.div>

          {/* Accordion */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {currentCategory.questions.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  question={item.q}
                  answer={item.a}
                  isOpen={openIndex === idx}
                  onToggle={() => handleToggle(idx)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </section>

        {/* ── Contact Support CTA ───────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl px-8 py-12 text-center shadow-xl shadow-blue-200 relative overflow-hidden"
          >
            {/* subtle corner decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-800/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5">
                <MessageCircle size={26} className="text-white" />
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white mb-3"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Still have questions?
              </h2>
              <p
                className="text-blue-100 text-sm sm:text-base mb-7 max-w-sm mx-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Our support team is here to help. Reach out anytime and we'll
                get back to you promptly.
              </p>
              <button
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-7 py-3.5 rounded-full shadow-lg hover:bg-blue-50 hover:shadow-xl transition-all duration-200 active:scale-95"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <MessageCircle size={16} />
                Contact Support
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </>
  );
}