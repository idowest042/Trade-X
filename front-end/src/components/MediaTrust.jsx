import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award } from 'lucide-react';

/**
 * MediaTrust Component
 * 
 * Purpose: Instant credibility boost through media recognition
 * Goals: Reassure visitors, signal trustworthiness, support conversion
 * 
 * Design philosophy: Corporate-grade credibility
 * - Clean white background
 * - Neutral grayscale logos
 * - Subtle animations
 * - Generous spacing
 */

const MediaTrust = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Media outlets data
  const mediaOutlets = [
    {
      name: 'Forbes',
      textStyle: 'font-serif text-3xl font-bold tracking-tight'
    },
    {
      name: 'Fortune',
      textStyle: 'font-serif text-3xl font-bold tracking-wide'
    },
    {
      name: 'CoinTelegraph',
      textStyle: 'font-bold text-2xl tracking-tight',
      customStyle: 'relative'
    },
    {
      name: 'CoinDesk',
      textStyle: 'font-bold text-2xl tracking-wide'
    },
    {
      name: 'Blockonomi',
      textStyle: 'font-bold text-2xl tracking-tight'
    },
    {
      name: 'RTL Boulevard',
      textStyle: 'font-bold text-2xl tracking-tight'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const logoVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
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
      
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/30 to-transparent" />

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
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full"
          >
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700 tracking-wide">
              MEDIA RECOGNITION
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            As Featured In
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            TradeX has been recognized by leading global media outlets.
          </p>
        </motion.div>

        {/* Media Logos Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 items-center"
        >
          {mediaOutlets.map((outlet, index) => (
            <motion.div
              key={index}
              variants={logoVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              className="flex items-center justify-center"
            >
              {/* Logo Container */}
              <div className="group relative w-full h-24 flex items-center justify-center p-4 rounded-xl transition-all duration-300">
                
                {/* Hover background */}
                <div className="absolute inset-0 rounded-xl bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Logo as text */}
                <div className={`relative text-slate-400 group-hover:text-slate-700 transition-colors duration-300 text-center ${outlet.textStyle}`}>
                  {outlet.name === 'Forbes' && (
                    <div className="flex flex-col">
                      <span className="text-4xl">FORBES</span>
                    </div>
                  )}
                  
                  {outlet.name === 'Fortune' && (
                    <div className="flex flex-col">
                      <span className="text-4xl">FORTUNE</span>
                    </div>
                  )}
                  
                  {outlet.name === 'CoinTelegraph' && (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold tracking-widest mb-0.5">COIN</span>
                      <span className="text-2xl font-bold tracking-tight">TELEGRAPH</span>
                    </div>
                  )}
                  
                  {outlet.name === 'CoinDesk' && (
                    <div className="flex flex-col items-center">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-2xl font-bold">Coin</span>
                        <span className="text-2xl font-bold">Desk</span>
                      </div>
                    </div>
                  )}
                  
                  {outlet.name === 'Blockonomi' && (
                    <div className="flex flex-col">
                      <span className="text-xl font-bold tracking-tight">BLOCKONOMI</span>
                    </div>
                  )}
                  
                  {outlet.name === 'RTL Boulevard' && (
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-bold tracking-wider">RTL</span>
                      <span className="text-xs font-semibold tracking-widest">BOULEVARD</span>
                    </div>
                  )}
                </div>

                {/* Subtle border on hover */}
                <div className="absolute inset-0 rounded-xl border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional: Trust stat below logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 pt-12 border-t border-slate-200 text-center"
        >
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Our commitment to transparency and innovation has earned recognition from 
            leading financial and technology publications worldwide.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default MediaTrust;