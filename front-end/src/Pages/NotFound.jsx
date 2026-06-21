import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Home, 
  ArrowRight, 
  Search, 
  AlertCircle,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  // Floating animation variants
  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  // Quick links for helpful navigation
  const quickLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Investment Plans', path: '/pricing', icon: TrendingUp },
    { label: 'How It Works', path: '/how-it-works', icon: Zap },
    { label: 'Security', path: '/security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient orbs */}
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            className="absolute top-20 right-10 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"
          />
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '1.5s' }}
            className="absolute bottom-20 left-10 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"
          />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        </div>

        {/* Main content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            
            {/* 404 Number with Glitch Effect */}
            <motion.div
              variants={itemVariants}
              className="relative inline-block mb-8"
            >
              {/* Main 404 text */}
              <div className="relative">
                <motion.h1
                  variants={pulseVariants}
                  initial="initial"
                  animate="animate"
                  className="text-8xl sm:text-9xl lg:text-[12rem] font-bold leading-none tracking-tight"
                  style={{ 
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  404
                </motion.h1>
                
                {/* Decorative line through the number */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
                </div>
              </div>
            </motion.div>

            {/* Error Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-red-50 border border-red-200/60 rounded-full"
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700 tracking-wide">
                PAGE NOT FOUND
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Oops! Looks like you're lost
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, we'll help you find your way back.
            </motion.p>

            {/* Search Bar - Interactive */}
            <motion.div
              variants={itemVariants}
              className="max-w-md mx-auto mb-12"
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search our platform..."
                  className="w-full px-6 py-4 pl-14 bg-white border-2 border-slate-200 rounded-2xl 
                    focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                    transition-all duration-300 text-slate-900 placeholder-slate-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 
                  group-focus-within:text-blue-500 transition-colors" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 
                  text-white text-sm font-semibold rounded-xl hover:bg-blue-700 
                  transition-colors duration-200">
                  Search
                </button>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 
                    text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-600/30 
                    hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 
                    transition-all duration-300"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link to="/pricing">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white 
                    text-blue-600 font-semibold text-lg rounded-xl border-2 border-blue-600 
                    hover:bg-blue-50 transition-colors duration-300"
                >
                  View Investment Plans
                  <TrendingUp className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>

            {/* Quick Links Grid */}
            <motion.div
              variants={itemVariants}
              className="border-t border-slate-200 pt-12"
            >
              <p className="text-sm text-slate-500 mb-6 font-medium tracking-wide">
                QUICK NAVIGATION
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="group inline-flex items-center gap-2 px-5 py-3 bg-slate-50 
                        border border-slate-200 rounded-xl hover:border-blue-300 
                        hover:bg-blue-50 transition-all duration-300"
                    >
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-blue-600 
                        transition-colors" />
                      <span className="text-sm font-medium text-slate-700 
                        group-hover:text-blue-600 transition-colors">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>500K+ Users</span>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;