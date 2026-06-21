import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Added this import
import useAuthStore from '../stores/useauthstore'; // Added this import
import { 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  Shield,
  LineChart,
  Zap,
  Target,
  DollarSign,
  ArrowRight,
  Lightbulb,
  AlertTriangle,
  PieChart,
  Activity,
  Newspaper,
  BookMarked,
  ChevronRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Learn Page Component
 * 
 * Purpose: Comprehensive crypto education hub
 * Style: Premium trading platform (Binance/Coinbase-inspired)
 * Goal: Educate users → Convert to traders/investors
 * 
 * Sections:
 * 1. Hero with dual CTAs (Trade + Invest)
 * 2. Learning Paths (4 main paths)
 * 3. Trading Guides (practical how-tos)
 * 4. Investment Education (long-term strategies)
 * 5. Market Insights (real-world analysis)
 * 6. Crypto Glossary (key terms)
 * 7. Final CTA (dual action)
 */

const Learn = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Refs for scroll animations
  const pathsRef = useRef(null);
  const guidesRef = useRef(null);
  const investmentRef = useRef(null);
  const insightsRef = useRef(null);
  const glossaryRef = useRef(null);

  const pathsInView = useInView(pathsRef, { once: true, margin: "-100px" });
  const guidesInView = useInView(guidesRef, { once: true, margin: "-100px" });
  const investmentInView = useInView(investmentRef, { once: true, margin: "-100px" });
  const insightsInView = useInView(insightsRef, { once: true, margin: "-100px" });
  const glossaryInView = useInView(glossaryRef, { once: true, margin: "-100px" });

  // Animation variants
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  // Handle trade button click
  const handleStartTrading = () => {
    if (isAuthenticated) {
      navigate('/dashboard/trade');
    } else {
      navigate('/register');
    }
  };

  // Handle invest button click
  const handleInvestNow = () => {
    if (isAuthenticated) {
      navigate('/dashboard/plans');
    } else {
      navigate('/register');
    }
  };

  // Learning Paths Data
  const learningPaths = [
    {
      icon: BookOpen,
      title: 'Beginner Crypto Guide',
      description: 'Start your crypto journey with fundamentals: wallets, blockchain basics, and first steps.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: LineChart,
      title: 'Crypto Trading Fundamentals',
      description: 'Learn how to read charts, place trades, and understand market movements.',
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: BarChart3,
      title: 'Technical Analysis',
      description: 'Understand support, resistance, indicators, and price action strategies.',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Investment Strategies',
      description: 'Build long-term portfolios, manage risk, and grow wealth sustainably.',
      color: 'from-indigo-600 to-blue-700'
    }
  ];

  // Trading Guides Data
  const tradingGuides = [
    {
      icon: LineChart,
      title: 'How to Read Crypto Charts',
      description: 'Candlesticks, trend lines, and volume analysis explained.',
      duration: '15 min read'
    },
    {
      icon: Zap,
      title: 'Spot Trading Explained',
      description: 'Buy low, sell high - the fundamentals of spot trading.',
      duration: '10 min read'
    },
    {
      icon: Activity,
      title: 'Market Orders vs Limit Orders',
      description: 'Choose the right order type for your trading strategy.',
      duration: '8 min read'
    },
    {
      icon: AlertTriangle,
      title: 'Understanding Volatility',
      description: 'How price swings affect your trades and risk management.',
      duration: '12 min read'
    },
    {
      icon: Lightbulb,
      title: 'Trading Psychology',
      description: 'Master emotions, avoid FOMO, and trade rationally.',
      duration: '20 min read'
    }
  ];

  // Investment Education Data
  const investmentTopics = [
    {
      icon: TrendingUp,
      title: 'Long-Term Crypto Investing',
      description: 'HODLing strategies and identifying quality projects.'
    },
    {
      icon: PieChart,
      title: 'Portfolio Diversification',
      description: 'Spread risk across Bitcoin, altcoins, and stablecoins.'
    },
    {
      icon: DollarSign,
      title: 'Passive Income Strategies',
      description: 'Staking, yield farming, and earning while you hold.'
    },
    {
      icon: Target,
      title: 'Compounding in Crypto',
      description: 'Reinvest profits to accelerate portfolio growth.'
    }
  ];

  // Market Insights Data
  const marketInsights = [
    {
      icon: Newspaper,
      title: 'Bitcoin Market Trends',
      description: 'Current BTC movements and institutional adoption signals.',
      tag: 'Trending'
    },
    {
      icon: Activity,
      title: 'Altcoin Opportunities',
      description: 'Emerging projects and high-potential cryptocurrencies.',
      tag: 'Analysis'
    },
    {
      icon: AlertTriangle,
      title: 'Risk Signals in the Market',
      description: 'Identify warning signs before market corrections.',
      tag: 'Risk'
    },
    {
      icon: Lightbulb,
      title: 'How News Affects Crypto Prices',
      description: 'Understanding regulatory news, partnerships, and FUD.',
      tag: 'Insight'
    }
  ];

  // Crypto Glossary Terms
  const glossaryTerms = [
    { term: 'Liquidity', definition: 'How easily an asset can be bought or sold without affecting its price.' },
    { term: 'Market Cap', definition: 'Total value of a cryptocurrency (price × circulating supply).' },
    { term: 'Leverage', definition: 'Borrowing funds to increase trading position size and potential returns.' },
    { term: 'Bull Market', definition: 'Market condition where prices are rising and sentiment is optimistic.' },
    { term: 'Bear Market', definition: 'Market condition where prices are falling and sentiment is pessimistic.' },
    { term: 'Order Book', definition: 'Real-time list of buy and sell orders for an asset.' },
    { term: 'Spread', definition: 'Difference between the highest bid and lowest ask price.' },
    { term: 'HODL', definition: 'Hold On for Dear Life - long-term holding strategy despite volatility.' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white pt-24 pb-16 overflow-hidden">
        
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #3B82F6 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-blue-50 border border-blue-200/60 rounded-full">
              <BookMarked className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 tracking-wide">
                EDUCATION CENTER
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              Learn Trading and Investing<br />with TradeX
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Master crypto trading strategies, understand market trends, and grow your 
              investments confidently.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={handleStartTrading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Start Trading
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                onClick={handleInvestNow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-xl border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-300"
              >
                Start Investing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Paths */}
      <section ref={pathsRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={pathsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Learning Paths
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose your journey based on your experience and goals
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate={pathsInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {learningPaths.map((path, index) => (
              <motion.div
                key={index}
                variants={fadeInUpVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${path.color} rounded-xl mb-4`}>
                  <path.icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {path.title}
                </h3>
                
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {path.description}
                </p>

                <button className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Explore
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trading Guides */}
      <section ref={guidesRef} className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={guidesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Trading Guides
            </h2>
            <p className="text-lg text-slate-600">
              Practical guides for active traders
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate={guidesInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tradingGuides.map((guide, index) => (
              <motion.div
                key={index}
                variants={fadeInUpVariants}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <guide.icon className="w-6 h-6 text-blue-600" strokeWidth={2} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                      {guide.description}
                    </p>
                    <span className="text-xs text-slate-500 font-medium">
                      {guide.duration}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Investment Education */}
      <section ref={investmentRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={investmentInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Investment Education
            </h2>
            <p className="text-lg text-slate-600">
              Build long-term wealth with smart strategies
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate={investmentInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 gap-6"
          >
            {investmentTopics.map((topic, index) => (
              <motion.div
                key={index}
                variants={fadeInUpVariants}
                whileHover={{ scale: 1.02 }}
                className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center">
                    <topic.icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {topic.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Market Insights */}
      <section ref={insightsRef} className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={insightsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Market Insights
            </h2>
            <p className="text-lg text-slate-600">
              Stay informed with real-world analysis
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate={insightsInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {marketInsights.map((insight, index) => (
              <motion.div
                key={index}
                variants={fadeInUpVariants}
                whileHover={{ y: -6 }}
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    insight.tag === 'Trending' ? 'bg-green-100 text-green-700' :
                    insight.tag === 'Risk' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {insight.tag}
                  </span>
                </div>

                <div className="mb-4">
                  <insight.icon className="w-8 h-8 text-blue-600" strokeWidth={2} />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {insight.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {insight.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Crypto Glossary */}
      <section ref={glossaryRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={glossaryInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Crypto Glossary
            </h2>
            <p className="text-lg text-slate-600">
              Essential terms every trader and investor should know
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            animate={glossaryInView ? "visible" : "hidden"}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {glossaryTerms.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUpVariants}
                className="bg-slate-50 rounded-lg p-4 hover:bg-blue-50 transition-colors duration-300 border border-slate-200 hover:border-blue-200"
              >
                <h3 className="text-sm font-bold text-blue-600 mb-2">
                  {item.term}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.definition}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Start Trading or Investing?
            </h2>
            
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Put your knowledge into action with TradeX
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={handleStartTrading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Trading
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                onClick={handleInvestNow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white font-semibold text-lg rounded-xl shadow-lg hover:bg-green-600 transition-colors duration-300"
              >
                Invest Now
                <TrendingUp className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Learn;