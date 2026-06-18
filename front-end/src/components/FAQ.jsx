import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: "Is TradeX a legitimate platform?",
    answer: "Yes. TradeX operates with transparency and follows strict security and verification standards to ensure user funds and data are protected."
  },
  {
    id: 2,
    question: "How do I start investing?",
    answer: "Create an account, complete your KYC verification, deposit funds, and choose an investment plan that suits your goals."
  },
  {
    id: 3,
    question: "Is my money safe?",
    answer: "TradeX uses advanced security protocols and account verification to safeguard all transactions and user balances."
  },
  {
    id: 4,
    question: "How long does withdrawal take?",
    answer: "Withdrawals are processed quickly once approved, usually within a short timeframe depending on network conditions."
  },
  {
    id: 5,
    question: "Do I need to verify my identity?",
    answer: "Yes. KYC verification is required to access withdrawals and ensure a secure trading environment for all users."
  },
  {
    id: 6,
    question: "Are there hidden fees?",
    answer: "No. All applicable charges are clearly displayed before any transaction is completed."
  }
];

const FAQ = () => {
  const [openId, setOpenId] = useState(1);

  const toggleItem = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-0"
        >
          {faqs.map((faq, index) => (
            <div key={faq.id}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`border-b border-gray-200 transition-colors ${
                  openId === faq.id ? 'bg-blue-50/50' : ''
                }`}
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full py-6 px-6 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
                  aria-expanded={openId === faq.id}
                >
                  <span
                    className={`text-lg font-semibold pr-8 transition-colors ${
                      openId === faq.id ? 'text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openId === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex-shrink-0"
                  >
                    {openId === faq.id ? (
                      <Minus className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Plus className="w-5 h-5 text-blue-600" />
                    )}
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;