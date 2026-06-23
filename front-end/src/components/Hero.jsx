import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import useAuthStore from '../stores/useauthstore'; // Added this import
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Award,
  ArrowRight,
  BarChart3,
  Lock,
  Users
} from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Handle Start Trading button click
  const handleStartTrading = () => {
    if (isAuthenticated) {
      navigate('/dashboard/trade');
    } else {
      navigate('/register');
    }
  };

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  const floatingVariants = {
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

  // Trust indicators data
  const trustIndicators = [
    {
      icon: Shield,
      label: 'Bank-Grade Security',
      description: 'Your assets are protected'
    },
    {
      icon: Award,
      label: 'Regulated Platform',
      description: 'Fully licensed & compliant'
    },
    {
      icon: Users,
      label: '500K+ Traders',
      description: 'Join our community'
    },
    {
      icon: BarChart3,
      label: 'Real-Time Analytics',
      description: 'Professional trading tools'
    }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white overflow-hidden">
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          className="absolute top-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: '1s' }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Main content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              <Zap className="w-4 h-4 mr-2" />
              Advanced Trading Platform
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Trade Smarter.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              Grow Your Capital
            </span>
            <br />
            With Confidence.
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Access global forex and cryptocurrency markets with institutional-grade tools, 
            real-time analytics, and automated trading strategies. Built for traders who 
            demand precision, security, and performance.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              onClick={handleStartTrading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 flex items-center text-lg w-full sm:w-auto justify-center"
            >
              Start Trading
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <Link to="/learn">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm flex items-center text-lg w-full sm:w-auto justify-center"
              >
                Learn More
                <TrendingUp className="ml-2 w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
          >
            {trustIndicators.map((indicator, index) => (
              <motion.div
                key={index}
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                style={{ animationDelay: `${index * 0.3}s` }}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <indicator.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {indicator.label}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {indicator.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

     

          {/* Security badge */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex items-center justify-center gap-6 flex-wrap"
          >
            <div className="flex items-center text-sm text-gray-600">
              <Lock className="w-4 h-4 mr-2 text-green-600" />
              <span className="font-medium">SSL Encrypted</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="w-4 h-4 mr-2 text-green-600" />
              <span className="font-medium">2FA Protected</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Award className="w-4 h-4 mr-2 text-green-600" />
              <span className="font-medium">Regulated & Licensed</span>
            </div>
          </motion.div>

        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;