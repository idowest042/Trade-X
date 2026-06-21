import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Lock, FileCheck, Eye, ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom'; // Added this import

/**
 * TrustSecurity Component
 * 
 * Purpose: Reduce user anxiety and build confidence before investing
 * Communicates: Protection, reliability, security, legitimacy
 * 
 * Design philosophy: Calm institutional trust (fintech-grade)
 * - Clean white background
 * - Blue accents (trust, stability)
 * - Green CTA (action, growth)
 * - Subtle, professional animations
 */

const TrustSecurity = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Security features data
  const securityFeatures = [
    {
      icon: ShieldCheck,
      title: "Secure Transactions",
      description: "All transactions are protected with multiple layers of security."
    },
    {
      icon: Lock,
      title: "Data Privacy",
      description: "Your personal information is kept private and never shared."
    },
    {
      icon: FileCheck,
      title: "Regulatory Compliance",
      description: "TradeX operates under strict compliance standards."
    },
    {
      icon: Eye,
      title: "24/7 Monitoring",
      description: "Continuous monitoring to detect and prevent suspicious activity."
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 bg-white overflow-hidden"
    >
      
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.02]">
        <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="150" stroke="#3B82F6" strokeWidth="1" />
          <circle cx="200" cy="200" r="200" stroke="#3B82F6" strokeWidth="1" />
          <circle cx="200" cy="200" r="250" stroke="#3B82F6" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Text Content */}
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="lg:pr-8"
          >
            {/* Small badge with shield icon */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 border border-blue-200/60 rounded-full"
            >
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 tracking-wide">
                SECURITY & TRUST
              </span>
            </motion.div>

            {/* Main heading */}
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Your Security Is Our Priority
            </h2>

            {/* Subtext */}
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              TradeX is built with industry-grade security to protect your funds and personal data at every step.
            </p>

            {/* Supporting paragraph */}
            <p className="text-base text-slate-600 mb-10 leading-relaxed">
              We understand that trust is earned. That's why we've implemented comprehensive security measures, maintain strict regulatory compliance, and operate with complete transparency. Your investments are protected by the same security standards used by leading financial institutions worldwide.
            </p>

            {/* Call to action */}
            <Link to="/how-it-works">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-600/85 text-white font-semibold text-lg rounded-xl shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 transition-all duration-300"
              >
                Invest with Confidence
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </Link>

            {/* Trust stats (optional subtle detail) */}
            <div className="mt-10 pt-10 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-6 text-center lg:text-left">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">256-bit</div>
                  <div className="text-sm text-slate-500 font-medium">Encryption Standard</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
                  <div className="text-sm text-slate-500 font-medium">Uptime Guarantee</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Security Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -4,
                  transition: { duration: 0.2, ease: "easeOut" }
                }}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-blue-200/60 transition-all duration-300"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative">
                  {/* Icon container */}
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 border border-blue-200/60 group-hover:border-blue-300 group-hover:bg-blue-100 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-blue-600" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
                    <path d="M64 0 L64 16 C64 16 48 16 32 32 L24 24 C40 8 40 0 40 0 Z" fill="#3B82F6" fillOpacity="0.05" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* Bottom trust badges (optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 pt-12 border-t border-slate-200"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale">
            {/* Placeholder for trust badges/certifications */}
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-sm font-semibold">ISO Certified</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Lock className="w-6 h-6" />
              <span className="text-sm font-semibold">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <FileCheck className="w-6 h-6" />
              <span className="text-sm font-semibold">Fully Regulated</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Eye className="w-6 h-6" />
              <span className="text-sm font-semibold">24/7 Monitored</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default TrustSecurity;