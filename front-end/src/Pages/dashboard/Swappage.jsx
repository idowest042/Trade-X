import { useState, useEffect } from "react";
import { ArrowLeftRight, ArrowUpDown, Info, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../../stores/useAuthStore";
import api from "../../lib/api";

const CURRENCIES = ["USD", "USDT", "BTC", "ETH", "SOL", "BNB"];
const ICONS = {
  USD:  { sym: "$",   color: "bg-green-500"  },
  USDT: { sym: "₮",   color: "bg-teal-500"   },
  BTC:  { sym: "₿",   color: "bg-orange-500" },
  ETH:  { sym: "Ξ",   color: "bg-indigo-500" },
  SOL:  { sym: "◎",   color: "bg-purple-500" },
  BNB:  { sym: "B",   color: "bg-yellow-500" },
};

function CurrencyIcon({ currency, size = "sm" }) {
  const c = ICONS[currency] || { sym: currency[0], color: "bg-slate-400" };
  const sz = size === "lg" ? "w-10 h-10 text-base" : "w-7 h-7 text-xs";
  return (
    <div className={`${sz} ${c.color} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {c.sym}
    </div>
  );
}

function HistoryRow({ swap }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1">
          <CurrencyIcon currency={swap.fromCurrency} />
          <ArrowLeftRight size={12} className="text-slate-300 flex-shrink-0" />
          <CurrencyIcon currency={swap.toCurrency} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {swap.fromCurrency} → {swap.toCurrency}
          </p>
          <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {new Date(swap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
          +{swap.convertedAmount.toFixed(6)} {swap.toCurrency}
        </p>
        <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          from {swap.amount} {swap.fromCurrency}
        </p>
      </div>
    </div>
  );
}

export default function SwapPage() {
  const { user } = useAuthStore();
  const [rates,    setRates]    = useState({});
  const [balances, setBalances] = useState({});
  const [from,     setFrom]     = useState("USD");
  const [to,       setTo]       = useState("BTC");
  const [amount,   setAmount]   = useState("");
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [histLoad, setHistLoad] = useState(true);

  // Derived preview values
  const parsed     = parseFloat(amount) || 0;
  const fee        = parseFloat((parsed * 0.02).toFixed(8));
  const netUSD     = parsed * (rates[from] || 1) * 0.98;
  const converted  = rates[to] ? parseFloat((netUSD / rates[to]).toFixed(8)) : 0;
  const fromBal    = balances[from] ?? 0;
  const canSwap    = parsed > 0 && parsed <= fromBal && from !== to && !loading;

  useEffect(() => {
    Promise.all([
      api.get("/api/swap/rates"),
      api.get("/api/swap/my"),
      api.get("/api/auth/me"),
    ]).then(([ratesRes, histRes, meRes]) => {
      setRates(ratesRes.data.rates || {});
      setHistory(histRes.data.swaps || []);
      const u = meRes.data.user;
      setBalances({
        USD:  u.balance || 0,
        ...u.cryptoBalances,
      });
    }).catch(() => {})
      .finally(() => setHistLoad(false));
  }, []);

  const handleFlip = () => {
    setFrom(to);
    setTo(from);
    setAmount("");
  };

  const handleSwap = async () => {
    if (!canSwap) return;
    setLoading(true);
    const tid = toast.loading("Processing swap…");
    try {
      const { data } = await api.post("/api/swap", { fromCurrency: from, toCurrency: to, amount: parsed });
      toast.success("Swap complete!", {
        id: tid,
        description: `${parsed} ${from} → ${data.converted} ${to}`,
      });
      setHistory(prev => [data.swap, ...prev]);
      setBalances(prev => ({
        ...prev,
        [from]: Math.max(0, (prev[from] || 0) - parsed),
        [to]:   (prev[to] || 0) + data.converted,
      }));
      setAmount("");
    } catch (err) {
      toast.error("Swap failed", { id: tid, description: err.response?.data?.message || "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Crypto Swap</h1>
          <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Instantly exchange between currencies. A 2% fee applies to all swaps.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Swap form ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Balances row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {CURRENCIES.map(c => (
                <div key={c} className="bg-white border border-slate-100 rounded-xl px-2.5 py-2 text-center">
                  <CurrencyIcon currency={c} size="sm" />
                  <p className="text-[10px] font-semibold text-slate-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{c}</p>
                  <p className="text-xs font-bold text-slate-800 truncate" style={{ fontFamily: "'Sora', sans-serif" }}>
                    {(balances[c] || 0).toFixed(c === "USD" || c === "USDT" ? 2 : 6)}
                  </p>
                </div>
              ))}
            </div>

            {/* Swap card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">

              {/* FROM */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>From</label>
                <div className="flex gap-2">
                  <select value={from} onChange={e => setFrom(e.target.value)}
                    className="flex-shrink-0 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {CURRENCIES.filter(c => c !== to).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                      placeholder="0.00" min="0"
                      className={`w-full px-4 py-3 rounded-xl border text-slate-900 text-sm bg-slate-50
                        focus:outline-none focus:ring-2 focus:bg-white transition-all
                        ${parsed > fromBal && parsed > 0 ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500 focus:border-transparent"}`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Balance: <span className={`font-semibold ${parsed > fromBal && parsed > 0 ? "text-red-500" : "text-slate-600"}`}>
                      {fromBal.toFixed(from === "USD" || from === "USDT" ? 2 : 6)} {from}
                    </span>
                  </p>
                  <button onClick={() => setAmount(String(fromBal))}
                    className="text-xs text-blue-600 font-semibold hover:underline" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    MAX
                  </button>
                </div>
              </div>

              {/* Flip button */}
              <div className="flex justify-center">
                <button onClick={handleFlip}
                  className="w-10 h-10 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center text-blue-600 transition-all hover:rotate-180 duration-300">
                  <ArrowUpDown size={17} />
                </button>
              </div>

              {/* TO */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>To</label>
                <div className="flex gap-2">
                  <select value={to} onChange={e => setTo(e.target.value)}
                    className="flex-shrink-0 px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {CURRENCIES.filter(c => c !== from).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-blue-700"
                    style={{ fontFamily: "'Sora', sans-serif" }}>
                    {converted > 0 ? converted.toFixed(8) : "0.00000000"}
                  </div>
                </div>
              </div>

              {/* Preview */}
              {parsed > 0 && parsed <= fromBal && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5 space-y-2">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>Swap Preview</p>
                  {[
                    ["You send",     `${parsed} ${from}`],
                    ["Fee (2%)",     `${fee.toFixed(8)} ${from} ≈ $${(fee * (rates[from]||1)).toFixed(2)}`],
                    ["You receive",  `${converted.toFixed(8)} ${to}`],
                    ["Rate",         `1 ${from} = ${(rates[from]/rates[to]).toFixed(8)} ${to}`],
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      <span className="text-blue-500">{k}</span>
                      <span className="font-semibold text-blue-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Rate info */}
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-2.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Info size={12} className="flex-shrink-0" />
                Rates are admin-controlled and updated periodically. 2% fee deducted from source amount.
              </div>

              <button onClick={handleSwap} disabled={!canSwap}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-200 disabled:shadow-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : <ArrowLeftRight size={15} />}
                {loading ? "Processing…" : `Swap ${from} → ${to}`}
              </button>
            </div>
          </div>

          {/* ── History ───────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-6">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <ArrowLeftRight size={15} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Swap History</p>
              </div>
              <div className="px-5">
                {histLoad ? (
                  <div className="py-6 space-y-3 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl" />)}
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-10 text-center">
                    <ArrowLeftRight size={22} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>No swaps yet</p>
                  </div>
                ) : history.map(s => <HistoryRow key={s._id} swap={s} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}