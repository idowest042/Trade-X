import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, Wallet, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

/**
 * HowItWorks Component
 * 
 * Premium 3-step explainer for TradeX landing page
 * Design philosophy: Clean institutional fintech with subtle premium touches
 * 
 * Key design decisions:
 * - Typography: DM Sans for refined modern feel (not Inter/Roboto)
 * - Layout: Asymmetric step numbers create visual interest
 * - Color: Emerald green as primary accent (fresh, growth-oriented)
 * - Animation: Subtle, performance-friendly, professional
 * - Whitespace: Generous padding for breathing room
 */

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Step data
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create an Account",
      description: "Sign up and set up your TradeX account in just a few clicks.",
      color: "from-blue-400 to-blue-500"
    },
    {
      number: "02",
      icon: Wallet,
      title: "Fund Your Wallet",
      description: "Add funds securely and choose an investment plan that fits your goals.",
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Invest & Grow",
      description: "Track your investments and watch your portfolio grow in real time.",
      color: "from-blue-600 to-blue-700"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] // Custom easing for smooth feel
      }
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-white via-slate-50/30 to-white overflow-hidden"
    >
      
      {/* Background decoration - subtle texture */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-20"
        >
          {/* Small badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 border border-blue-200/60 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700 tracking-wide">
              SIMPLE PROCESS
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            How TradeX Works
          </h2>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Start investing in minutes — simple, secure, transparent.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-blue-200/60 transition-all duration-300">
                
                {/* Gradient accent on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative">
                  
                  {/* Icon container */}
                  <div className="mb-6 relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 group-hover:border-blue-300 group-hover:scale-110 transition-all duration-300">
                      <step.icon className="w-8 h-8 text-blue-600" strokeWidth={2} />
                    </div>
                    
                    {/* Floating step number */}
                    <div className="absolute -top-3 -right-2 w-10 h-10 flex items-center justify-center">
                      <span className={`text-5xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-opacity duration-300`}>
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Decorative line */}
                  <div className="mt-6 h-1 w-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:w-20" />
                </div>

                {/* Connecting arrow (desktop only, not on last card) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-10 -translate-y-1/2 z-10">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
                    >
                      <ArrowRight className="w-8 h-8 text-blue-300" strokeWidth={2} />
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300"
          >
            Start Investing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </motion.button>

          {/* Trust indicators below CTA */}
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">No hidden fees</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">24/7 support</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;