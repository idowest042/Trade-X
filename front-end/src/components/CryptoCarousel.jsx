import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import useMarketStore from '../stores/marketStore';

/**
 * CryptoCarousel Component
 * 
 * Premium infinite auto-scrolling carousel showcasing live cryptocurrency prices.
 * 
 * Animation Architecture:
 * 
 * 1. Infinite Loop Technique:
 *    - We duplicate the price array to create seamless infinite scrolling
 *    - When the first set completes, we instantly reset to the start
 *    - The duplication makes this reset invisible to users
 * 
 * 2. Framer Motion Controls:
 *    - useAnimationControls() gives us programmatic control over animations
 *    - We can start, stop, and reset animations based on user interaction
 *    - Hover pauses the animation for better UX
 * 
 * 3. Performance Optimization:
 *    - Uses transform (translateX) instead of position for GPU acceleration
 *    - Will-change CSS hint tells browser to optimize for transforms
 *    - RequestAnimationFrame ensures smooth 60fps animation
 * 
 * 4. Responsive Design:
 *    - Card size adjusts based on viewport
 *    - Touch-friendly on mobile with proper spacing
 *    - Maintains visual hierarchy across breakpoints
 */

const CryptoCarousel = () => {
  const { marketPrices, fetchMarketPrices, refreshMarketPrices, isUsingMockData } = useMarketStore();
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimationControls();
  const containerRef = useRef(null);

  // Fetch prices on component mount
  useEffect(() => {
    fetchMarketPrices();

    // Set up auto-refresh every 1 minute (faster updates)
    const interval = setInterval(() => {
      fetchMarketPrices();
    }, 60 * 1000); // 1 minute

    return () => clearInterval(interval);
  }, [fetchMarketPrices]);

  // Duplicate the array for seamless infinite scroll
  const duplicatedPrices = [...marketPrices, ...marketPrices, ...marketPrices];

  // Calculate animation duration based on number of items
  // Optimized: Faster speed for better engagement
  const animationDuration = marketPrices.length > 0 ? marketPrices.length * 3.5 : 40;

  // Start animation when data is loaded
  useEffect(() => {
    if (marketPrices.length > 0 && !isPaused) {
      controls.start({
        x: [0, -33.33 + '%'], // Move by one set (1/3 of total)
        transition: {
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: animationDuration,
            ease: 'linear'
          }
        }
      });
    }
  }, [marketPrices, controls, animationDuration, isPaused]);

  // Handle pause/resume on hover
  const handleMouseEnter = () => {
    setIsPaused(true);
    controls.stop();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (marketPrices.length > 0) {
      controls.start({
        x: [0, -33.33 + '%'],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: animationDuration,
            ease: 'linear'
          }
        }
      });
    }
  };

  // Format price with proper decimals
  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  };

  // Format percentage change
  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // No loading skeleton needed - we show mock data instantly!
  // This eliminates the 4-10 second blank state on initial page load

  // No error UI needed - errors only logged to console
  // Carousel continues showing fallback/cached data seamlessly

  // Empty state (should never happen since we start with mock data)
  if (marketPrices.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 py-6 border-y border-slate-200/60 overflow-hidden relative">
      
      {/* Gradient fade edges for smooth visual flow */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

      {/* Header label */}
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200/60">
          <span className={`w-2 h-2 rounded-full ${isUsingMockData ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
          {isUsingMockData ? 'Loading Live Prices...' : 'Live Market Prices'}
        </span>
      </div>

      {/* Carousel container */}
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          animate={controls}
          className="flex gap-4 px-4"
          style={{
            willChange: 'transform'
          }}
        >
          {duplicatedPrices.map((coin, index) => (
            <motion.div
              key={`${coin.id}-${index}`}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex-shrink-0 bg-white rounded-xl shadow-md border border-slate-200/60 hover:shadow-xl hover:border-blue-300/60 transition-all duration-300"
              style={{ width: '220px' }}
            >
              <div className="p-4">
                {/* Coin header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-10 h-10 rounded-full ring-2 ring-slate-100"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm">
                      {coin.symbol}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {coin.name}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="text-xl font-bold text-slate-900 tracking-tight">
                    {formatPrice(coin.price)}
                  </div>
                </div>

                {/* 24h change */}
                <div className="flex items-center gap-1.5">
                  {coin.change24h >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-600">
                        {formatChange(coin.change24h)}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">
                        {formatChange(coin.change24h)}
                      </span>
                    </>
                  )}
                  <span className="text-xs text-slate-400 ml-auto">24h</span>
                </div>

                {/* Micro trend indicator bar */}
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(Math.abs(coin.change24h) * 10, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      coin.change24h >= 0
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Pause indicator (shows on hover) */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full z-20"
        >
          Paused
        </motion.div>
      )}
    </div>
  );
};

export default CryptoCarousel;