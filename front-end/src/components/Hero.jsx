import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useauthstore';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';

// ---- Deterministic "wall of screens" candlestick backdrop ----
// Seeded pseudo-random so the layout is stable across renders/SSR.
function seeded(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const COLUMNS = 46;
const ROWS_H = 100; // viewBox height units

function useMarketWall() {
  return useMemo(() => {
    let prevClose = 50;
    return Array.from({ length: COLUMNS }, (_, i) => {
      const drift = (seeded(i) - 0.5) * 22;
      const open = prevClose;
      const close = Math.min(92, Math.max(8, open + drift));
      const high = Math.max(open, close) + seeded(i + 100) * 8;
      const low = Math.min(open, close) - seeded(i + 200) * 8;
      prevClose = close;
      return { open, close, high, low };
    });
  }, []);
}

const MarketWall = () => {
  const candles = useMarketWall();
  const gap = 1000 / COLUMNS;

  return (
    <svg
      viewBox={`0 0 1000 ${ROWS_H}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      {candles.map((c, i) => {
        const x = i * gap + gap / 2;
        const bullish = c.close >= c.open;
        const color = bullish ? '#2dd4bf' : '#fb7185';
        const bodyTop = ROWS_H - (Math.max(c.open, c.close) / 100) * ROWS_H;
        const bodyBottom = ROWS_H - (Math.min(c.open, c.close) / 100) * ROWS_H;
        const wickTop = ROWS_H - (c.high / 100) * ROWS_H;
        const wickBottom = ROWS_H - (c.low / 100) * ROWS_H;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={wickTop} y2={wickBottom} stroke={color} strokeWidth="0.35" opacity="0.55" />
            <rect
              x={x - gap * 0.3}
              y={bodyTop}
              width={gap * 0.6}
              height={Math.max(bodyBottom - bodyTop, 0.6)}
              fill={color}
              opacity="0.55"
            />
          </g>
        );
      })}
    </svg>
  );
};

const TRUST = ['150+ countries', 'Regulated & licensed', '24/5 live markets'];

const Hero = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleStartTrading = () => {
    navigate(isAuthenticated ? '/dashboard/investments' : '/register');
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#060B16]">
      {/* backdrop: blurred wall of live charts, like a trading floor behind glass */}
      <div className="absolute inset-0 scale-110 blur-[3px] opacity-70">
        <MarketWall />
      </div>

      {/* contrast overlay so text stays readable over the chart wall */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060B16]/90 via-[#060B16]/75 to-[#060B16]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060B16] via-[#060B16]/40 to-transparent" />
      <div className="absolute -top-24 right-0 w-[28rem] h-[28rem] bg-blue-500/10 rounded-full blur-3xl" />

      {/* content */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 w-full py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          <div className="inline-block text-sm font-medium text-blue-300 border-b border-blue-400/40 pb-1 mb-6">
            Live forex, crypto & metals
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            Trade the markets that
            <span className="block text-blue-400">never stop moving.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-lg">
            Forex, crypto, and metals on one platform — live execution,
            tight spreads, and real-time charting built for traders who
            don't wait for the close.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={handleStartTrading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group px-7 py-3.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center text-base"
            >
              {isAuthenticated ? 'Go to dashboard' : 'Register'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {!isAuthenticated && (
              <motion.button
                onClick={() => navigate('/login')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-7 py-3.5 border border-white/30 text-white font-semibold rounded-lg hover:border-white/60 transition-colors text-base flex items-center justify-center"
              >
                Login
                <ArrowRight className="ml-2 w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* floating trust card, overlapping the bottom edge like a caption on the chart wall */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="mt-16 lg:mt-20 bg-white rounded-xl shadow-2xl px-6 py-5 max-w-xl flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <p className="text-gray-900 font-medium leading-snug">
              500K+ traders execute on TradeX every month.
            </p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200" />
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            {TRUST.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        className="absolute bottom-6 right-6 sm:right-10 text-white/50"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
};

export default Hero;