import { useState, useMemo, useEffect, useRef } from "react";
import { Search, ArrowUpDown, Star, TrendingUp, Flame, LayoutGrid, WifiOff, Radio } from "lucide-react";
import { isTradeable, formatPrice, formatCompact, getFavorites, toggleFavorite } from "./tradeUtils";

const CATEGORIES = [
  { id: "all",        label: "All",        icon: LayoutGrid },
  { id: "favorites",  label: "Favorites",  icon: Star },
  { id: "tradeable",  label: "Tradeable",  icon: TrendingUp },
  { id: "gainers",    label: "Gainers",    icon: TrendingUp },
  { id: "hot",        label: "Hot",        icon: Flame },
];

const SORT_COLUMNS = [
  { key: "price",     label: "Price" },
  { key: "change24h", label: "24h Change" },
  { key: "volume24h", label: "Volume" },
  { key: "marketCap", label: "Market Cap" },
];

export default function MarketView({ coins, loading, error, isFallback, isStale, onSelectCoin }) {
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("all");
  const [sortKey, setSortKey]   = useState("marketCap");
  const [sortDir, setSortDir]   = useState("desc");
  const [favorites, setFavorites] = useState(getFavorites());

  // ── Live price-flash — a real signal derived from actual poll-to-poll
  // price deltas, not decoration for its own sake. flashes[id] = 'up'|'down',
  // cleared ~700ms after each price change so the highlight reads as a
  // pulse, not a stuck color.
  const prevPricesRef = useRef({});
  const [flashes, setFlashes] = useState({});

  useEffect(() => {
    if (!coins.length) return;
    const next = {};
    coins.forEach((c) => {
      const prev = prevPricesRef.current[c.id];
      if (prev != null && c.price !== prev) next[c.id] = c.price > prev ? "up" : "down";
      prevPricesRef.current[c.id] = c.price;
    });
    if (Object.keys(next).length) {
      setFlashes((f) => ({ ...f, ...next }));
      const t = setTimeout(() => {
        setFlashes((f) => {
          const copy = { ...f };
          Object.keys(next).forEach((id) => delete copy[id]);
          return copy;
        });
      }, 700);
      return () => clearTimeout(t);
    }
  }, [coins]);

  // Stable rank by real market cap, independent of whatever sort/filter the
  // user currently has applied — mirrors how every real exchange keeps
  // BTC at #1 regardless of the active column sort.
  const rankById = useMemo(() => {
    const byCap = [...coins].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    return Object.fromEntries(byCap.map((c, i) => [c.id, i + 1]));
  }, [coins]);

  const handleFavoriteClick = (e, symbol) => {
    e.stopPropagation();
    setFavorites(toggleFavorite(symbol));
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let list = [...coins];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.name?.toLowerCase().includes(q) || c.symbol?.toLowerCase().includes(q));
    }

    if (category === "favorites") list = list.filter((c) => favorites.includes(c.symbol));
    if (category === "tradeable") list = list.filter((c) => isTradeable(c.symbol));
    if (category === "gainers")   list = list.filter((c) => c.change24h > 0).sort((a, b) => b.change24h - a.change24h);
    if (category === "hot")       list = [...list].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));

    if (category !== "gainers" && category !== "hot") {
      list.sort((a, b) => {
        const av = a[sortKey] ?? 0;
        const bv = b[sortKey] ?? 0;
        return sortDir === "desc" ? bv - av : av - bv;
      });
    }

    return list;
  }, [coins, search, category, favorites, sortKey, sortDir]);

  const healthy = !isFallback && !isStale && !loading && !error;

  return (
    <div className="space-y-3">
      {(isFallback || isStale) && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
          <WifiOff size={14} className="text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-400">
            {isFallback ? "Live pricing is temporarily unavailable — showing placeholder data." : "Showing slightly delayed prices while we reconnect to live data."}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coins…"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {healthy && (
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl whitespace-nowrap">
            <Radio size={11} className="animate-pulse" /> Live · CoinGecko
          </span>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                ${category === c.id ? "bg-slate-700 text-white" : "bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800"}`}>
              <Icon size={13} />{c.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2.5rem_2fr_repeat(4,1fr)] gap-2 px-4 py-2 border-b border-slate-800 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <span>#</span>
          <span>Coin</span>
          {SORT_COLUMNS.map((col) => (
            <button key={col.key} onClick={() => handleSort(col.key)} className="flex items-center justify-end gap-1 hover:text-slate-300 transition-colors">
              {col.label} <ArrowUpDown size={10} className={sortKey === col.key ? "text-blue-400" : "text-slate-600"} />
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading market data…</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-400">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">
            {category === "favorites" ? "No favorites yet — tap the star on any coin to add one." : "No coins match your search."}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 max-h-[70vh] overflow-y-auto">
            {filtered.map((c) => {
              const tradeable = isTradeable(c.symbol);
              const pos = c.change24h >= 0;
              const flash = flashes[c.id];
              return (
                <button key={c.id} onClick={() => onSelectCoin(c.symbol)}
                  className={`w-full grid grid-cols-[2.5rem_2fr_repeat(4,1fr)] gap-2 px-4 py-2.5 items-center hover:bg-slate-800/40 transition-colors text-left
                    ${flash === "up" ? "bg-green-500/10" : flash === "down" ? "bg-red-500/10" : ""}`}
                  style={{ transition: "background-color 0.6s ease" }}>
                  <span className="text-xs font-semibold text-slate-600">{rankById[c.id]}</span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button onClick={(e) => handleFavoriteClick(e, c.symbol)} className="flex-shrink-0 text-slate-600 hover:text-amber-400 transition-colors">
                      <Star size={13} fill={favorites.includes(c.symbol) ? "#fbbf24" : "none"} className={favorites.includes(c.symbol) ? "text-amber-400" : ""} />
                    </button>
                    {c.image ? (
                      <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full flex-shrink-0" onError={(e) => { e.target.style.visibility = "hidden"; }} />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300 flex-shrink-0">
                        {c.symbol?.[0]}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-100 text-sm truncate">{c.symbol}</span>
                        {tradeable && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" title="Tradeable on TradeX" />}
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block">{c.name}</span>
                    </div>
                  </div>
                  <span className={`text-right text-sm font-semibold ${flash === "up" ? "text-green-400" : flash === "down" ? "text-red-400" : "text-slate-100"}`}>
                    ${formatPrice(c.price)}
                  </span>
                  <span className={`text-right text-sm font-bold ${pos ? "text-green-400" : "text-red-400"}`}>
                    {pos ? "+" : ""}{(c.change24h || 0).toFixed(2)}%
                  </span>
                  <span className="text-right text-sm text-slate-400">${formatCompact(c.volume24h)}</span>
                  <span className="text-right text-sm text-slate-400">${formatCompact(c.marketCap)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}