import { ArrowLeft, Star, Info } from "lucide-react";
import { isTradeable, formatPrice, formatCompact, toggleFavorite, getFavorites } from "./tradeUtils";
import { useState } from "react";
import TradingTerminal from "./TradingTerminal";

// Non-tradeable coins have no chart: your backend has no historical OHLC
// source for anything outside the 4 simulated assets (CoinGecko's markets
// endpoint only gives a current snapshot). Rather than fake a chart, this
// shows the real stats you do have and is honest about the rest.
function NonTradeableCoinCard({ coin, onBack }) {
  const [favorites, setFavorites] = useState(getFavorites());
  const pos = coin.change24h >= 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={15} /> Back to Market
      </button>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          {coin.image ? (
            <img src={coin.image} alt={coin.symbol} className="w-12 h-12 rounded-full" />
          ) : (
            <span className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
              {coin.symbol?.[0]}
            </span>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{coin.name}</h2>
              <button onClick={() => setFavorites(toggleFavorite(coin.symbol))} className="text-slate-500 hover:text-amber-400 transition-colors">
                <Star size={16} fill={favorites.includes(coin.symbol) ? "#fbbf24" : "none"} className={favorites.includes(coin.symbol) ? "text-amber-400" : ""} />
              </button>
            </div>
            <span className="text-sm text-slate-500">{coin.symbol}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>${formatPrice(coin.price)}</span>
          <span className={`text-sm font-bold px-2 py-1 rounded-lg ${pos ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {pos ? "+" : ""}{(coin.change24h || 0).toFixed(2)}% (24h)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/40 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">24h High</p>
            <p className="text-sm font-bold text-green-400">${formatPrice(coin.high24h)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">24h Low</p>
            <p className="text-sm font-bold text-red-400">${formatPrice(coin.low24h)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">24h Volume</p>
            <p className="text-sm font-bold text-slate-100">${formatCompact(coin.volume24h)}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Market Cap</p>
            <p className="text-sm font-bold text-slate-100">${formatCompact(coin.marketCap)}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
          <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300 leading-relaxed">
            {coin.symbol} isn't available for trading on TradeX yet — trading currently supports BTC, ETH, SOL, and BNB.
            You're seeing live market data for reference only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CoinDetailView({
  symbol, marketCoin,
  prices, sessionStats, chartRef,
  balance, myOpenTradesForAsset,
  submitting, closing, live,
  onBack, onSelectAsset, onOpenTrade, onCloseTrade,
}) {
  if (!isTradeable(symbol)) {
    if (!marketCoin) {
      return (
        <div className="max-w-2xl mx-auto py-16 text-center text-sm text-slate-500">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6 mx-auto w-fit">
            <ArrowLeft size={15} /> Back to Market
          </button>
          Coin data not found.
        </div>
      );
    }
    return <NonTradeableCoinCard coin={marketCoin} onBack={onBack} />;
  }

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={15} /> Back to Market
      </button>
      <TradingTerminal
        asset={symbol}
        coinMeta={marketCoin}
        prices={prices}
        sessionStats={sessionStats}
        chartRef={chartRef}
        balance={balance}
        myOpenTradesForAsset={myOpenTradesForAsset}
        submitting={submitting}
        closing={closing}
        live={live}
        onSelectAsset={onSelectAsset}
        onOpenTrade={onOpenTrade}
        onCloseTrade={onCloseTrade}
      />
    </div>
  );
}