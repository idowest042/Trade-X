import { useEffect, useState } from "react";

/**
 * TradeX branded loading screen.
 * Shows a logo, animated chart-line pulse, and progress bar
 * for a fixed duration before calling onComplete.
 *
 * Props:
 *  - onComplete: function called when the loading animation finishes
 *  - duration: ms to display (default 2200)
 */
export default function LoadingScreen({ onComplete, duration = 2200 }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), duration - 400);
    const doneTimer = setTimeout(() => onComplete?.(), duration);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-400 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background grid, matches TradeX hero styling */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#1d4ed8 1px, transparent 1px), linear-gradient(90deg, #1d4ed8 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Logo */}
      <div className="relative flex items-center gap-1 mb-8">
        <span className="text-4xl font-extrabold text-blue-700 tracking-tight">
          Trade
        </span>
        <span className="text-4xl font-extrabold text-blue-500 tracking-tight">
          X
        </span>
      </div>

      {/* Animated candlestick / pulse bars */}
      <div className="relative flex items-end gap-1.5 h-16 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-2 rounded-full bg-gradient-to-t from-blue-700 to-blue-400"
            style={{
              animation: `tx-bar 1s ease-in-out ${i * 0.12}s infinite`,
              height: "20%",
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative w-48 h-1 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{
            animation: `tx-progress ${duration}ms linear forwards`,
          }}
        />
      </div>

      <p className="relative mt-4 text-sm text-gray-400 tracking-wide">
        Securing your session…
      </p>

      <style>{`
        @keyframes tx-bar {
          0%, 100% { height: 20%; opacity: 0.6; }
          50% { height: 100%; opacity: 1; }
        }
        @keyframes tx-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}