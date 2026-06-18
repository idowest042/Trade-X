import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  UserCheck, 
  Headset, 
  TrendingUp,
  Sparkles 
} from 'lucide-react';

/**
 * WhyChooseTradeX Component
 * 
 * Purpose: Establish credibility and reduce hesitation
 * Goals: Build trust, communicate advantages, feel professional
 * 
 * Design philosophy: Clean institutional trust
 * - White background
 * - Blue accents
 * - Clear visual hierarchy
 * - Scannable in under 5 seconds
 */

const WhyChooseTradeX = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Features data
  const features = [
    {
      icon: ShieldCheck,
      title: "Secure & Transparent",
      description: "Your funds and data are protected using industry-standard security protocols and transparent processes."
    },
    {
      icon: BarChart3,
      title: "Professional Trading Strategies",
      description: "Our expert traders use data-driven strategies to navigate the forex and crypto markets effectively."
    },
    {
      icon: Zap,
      title: "Fast Deposits & Withdrawals",
      description: "Seamless deposits and quick withdrawals ensure you stay in control of your funds at all times."
    },
    {
      icon: UserCheck,
      title: "Verified Accounts (KYC)",
      description: "KYC verification protects the platform from fraud and ensures a safe trading environment for all users."
    },
    {
      icon: Headset,
      title: "24/7 Support",
      description: "Our support team is available around the clock to assist you whenever you need help."
    },
    {
      icon: TrendingUp,
      title: "Designed for Growth",
      description: "Flexible investment plans tailored to different goals, risk levels, and experience."
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
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
      className="relative py-20 bg-white overflow-hidden"
    >
      
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
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
              COMPETITIVE ADVANTAGES
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Why Choose TradeX
          </h2>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A smarter, safer way to grow your wealth.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -6,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group"
            >
              {/* Card */}
              <div className="relative h-full bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-200/60 transition-all duration-300">
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative">
                  
                  {/* Icon container */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 border border-blue-200/60 group-hover:border-blue-300 group-hover:bg-blue-100 transition-all duration-300"
                  >
                    <feature.icon className="w-8 h-8 text-blue-600" strokeWidth={2} />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative line (appears on hover) */}
                  <div className="mt-6 h-1 w-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full group-hover:w-12 transition-all duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA or Trust Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl border border-blue-100">
            <div className="flex -space-x-2">
              {/* Avatar placeholders */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
                JD
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
                SM
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-white flex items-center justify-center text-white text-sm font-bold">
                AL
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                +50K
              </div>
            </div>
            <div className="text-left">
              <div className="text-slate-900 font-bold text-lg">
                Join 50,000+ active investors
              </div>
              <div className="text-slate-600 text-sm">
                Trading with confidence on TradeX
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default WhyChooseTradeX;