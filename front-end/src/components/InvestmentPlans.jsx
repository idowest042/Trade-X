import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Leaf, TrendingUp, Crown, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useauthstore' // Adjust the import path as needed

/**
 * InvestmentPlans Component
 * 
 * Purpose: Clear, conversion-focused pricing section
 * Goals: Help users compare plans, build confidence, drive action
 * 
 * Design philosophy: Clean fintech pricing
 * - White/light background
 * - Blue primary color
 * - Clear visual hierarchy
 * - Growth plan highlighted (most popular)
 */

const InvestmentPlans = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  
  // Get authentication state from Zustand store
  const { isAuthenticated } = useAuthStore();

  // Handle invest button click
  const handleInvestClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard/plans');
    } else {
      navigate('/register');
    }
  };

  // Investment plans data
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Leaf,
      description: 'Ideal for beginners',
      range: '$100 – $999',
      returns: 'Up to 8%',
      duration: '30 days',
      isPopular: false,
      color: 'from-blue-400 to-blue-500'
    },
    {
      id: 'growth',
      name: 'Growth',
      icon: TrendingUp,
      description: 'Ideal for steady investors',
      range: '$1,000 – $4,999',
      returns: 'Up to 15%',
      duration: '60 days',
      isPopular: true,
      badge: 'Most Popular',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      description: 'Ideal for experienced investors',
      range: '$5,000+',
      returns: 'Up to 25%',
      duration: '90 days',
      isPopular: false,
      color: 'from-blue-600 to-blue-700'
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

  const cardVariants = {
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

  // Subtle idle animation for popular plan
  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden"
    >
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
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
              INVESTMENT OPTIONS
            </span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Investment Plans
          </h2>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Choose a plan that matches your financial goals.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              {...(plan.isPopular && {
                variants: pulseVariants,
                initial: "initial",
                animate: isInView ? "animate" : "initial"
              })}
              whileHover={{ 
                y: -8,
                scale: plan.isPopular ? 1.03 : 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className={`relative group ${
                plan.isPopular 
                  ? 'lg:scale-105 lg:z-10' 
                  : ''
              }`}
            >
              {/* Card */}
              <div className={`relative h-full bg-white rounded-2xl p-8 transition-all duration-300 ${
                plan.isPopular
                  ? 'border-2 border-blue-500 shadow-xl shadow-blue-500/20'
                  : 'border border-slate-200/60 shadow-md hover:shadow-xl hover:border-blue-200/60'
              }`}>
                
                {/* Popular badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full shadow-lg">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative">
                  
                  {/* Icon */}
                  <div className={`mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl transition-all duration-300 ${
                    plan.isPopular
                      ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300'
                      : 'bg-blue-50 border border-blue-200/60 group-hover:border-blue-300 group-hover:bg-blue-100'
                  }`}>
                    <plan.icon className={`w-8 h-8 ${
                      plan.isPopular ? 'text-blue-700' : 'text-blue-600'
                    }`} strokeWidth={2} />
                  </div>

                  {/* Plan name */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 mb-6">
                    {plan.description}
                  </p>

                  {/* Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6" />

                  {/* Plan details */}
                  <div className="space-y-4 mb-8">
                    
                    {/* Investment Range */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-blue-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">Investment Range</div>
                        <div className="text-lg font-bold text-slate-900">{plan.range}</div>
                      </div>
                    </div>

                    {/* Expected Return */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-blue-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">Expected Return</div>
                        <div className="text-lg font-bold text-green-600">{plan.returns}</div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-blue-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-blue-600" strokeWidth={3} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">Duration</div>
                        <div className="text-lg font-bold text-slate-900">{plan.duration}</div>
                      </div>
                    </div>

                  </div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={handleInvestClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full group/btn inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    Invest Now
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </motion.button>

                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom info text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            All returns are projected estimates based on historical performance. Actual returns may vary. 
            Investments carry risk. Read our{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              terms and conditions
            </span>{' '}
            before investing.
          </p>
        </motion.div>

        {/* Optional: Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
        >
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            <span>No hidden fees</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            <span>Withdraw anytime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            <span>Secure transactions</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default InvestmentPlans;