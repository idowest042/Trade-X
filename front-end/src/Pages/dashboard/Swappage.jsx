import { useState, useEffect, useRef } from "react";
import { ArrowLeftRight, ArrowUpDown, Info } from "lucide-react";
import { toast } from "sonner";
import { getSocket } from "../../stores/socket";
import useAuthStore from "../../stores/useauthstore";
import api from "../../lib/api";

const CURRENCIES = ["USD", "USDT", "BTC", "ETH", "SOL", "BNB"];
const SYMBOLS = { USD: "$", USDT: "₮", BTC: "₿", ETH: "Ξ", SOL: "◎", BNB: "B" };

function CurrencyIcon({ currency, size = "sm" }) {
  const sym = SYMBOLS[currency] || currency[0];
  const sz = size === "lg" ? "w-10 h-10 text-base" : "w-7 h-7 text-xs";
  return (
    <div className={`${sz} rounded-md border border-slate-200 flex items-center justify-center font-semibold text-slate-600 flex-shrink-0`}>
      {sym}
    </div>
  );
}

function HistoryRow({ swap }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-1">
          <CurrencyIcon currency={swap.fromCurrency} />
          <ArrowLeftRight size={11} className="text-slate-300 flex-shrink-0" />
          <CurrencyIcon currency={swap.toCurrency} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {swap.fromCurrency} → {swap.toCurrency}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(swap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-emerald-600 tabular-nums">
          +{swap.convertedAmount.toFixed(6)} {swap.toCurrency}
        </p>
        <p className="text-xs text-slate-400 tabular-nums">
          from {swap.amount} {swap.fromCurrency}
        </p>
      </div>
    </div>
  );
}

export default function SwapPage() {
  const { token } = useAuthStore();
  const [rates,    setRates]    = useState({});
  const [balances, setBalances] = useState({});
  const [from,     setFrom]     = useState("USD");
  const [to,       setTo]       = useState("BTC");
  const [amount,   setAmount]   = useState("");
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [histLoad, setHistLoad] = useState(true);

  const parsed     = parseFloat(amount) || 0;
  const fee        = parseFloat((parsed * 0.02).toFixed(8));
  const netUSD     = parsed * (rates[from] || 1) * 0.98;
  const converted  = rates[to] ? parseFloat((netUSD / rates[to]).toFixed(8)) : 0;
  const fromBal    = balances[from] ?? 0;
  const canSwap    = parsed > 0 && parsed <= fromBal && from !== to && !loading;

  useEffect(() => {
    const sock = getSocket(token);

    const onBalance = (newBalance) => setBalances(prev => ({ ...prev, USD: newBalance }));
    const onCrypto  = (cryptoBalances) => setBalances(prev => ({ ...prev, ...cryptoBalances }));

    sock.on("balance:update", onBalance);
    sock.on("crypto:update",  onCrypto);

    return () => {
      sock.off("balance:update", onBalance);
      sock.off("crypto:update",  onCrypto);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Crypto swap</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Instantly exchange between currencies. A 2% fee applies to all swaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Swap form ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Balances row — one ledger strip instead of six colored tiles */}
          <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
            {CURRENCIES.map(c => (
              <div key={c} className="px-2.5 py-3 text-center">
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{c}</p>
                <p className="text-xs font-semibold text-slate-800 truncate mt-1 tabular-nums">
                  {(balances[c] || 0).toFixed(c === "USD" || c === "USDT" ? 2 : 6)}
                </p>
              </div>
            ))}
          </div>

          {/* Swap card */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">

            {/* FROM */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">From</label>
              <div className="flex gap-2">
                <select
                  value={from}
                  onChange={e => setFrom(e.target.value)}
                  className="flex-shrink-0 px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  {CURRENCIES.filter(c => c !== to).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className={`flex-1 px-4 py-3 rounded-lg border text-slate-900 text-sm bg-white tabular-nums
                    focus:outline-none focus:ring-1 transition-colors
                    ${parsed > fromBal && parsed > 0 ? "border-rose-300 focus:ring-rose-400" : "border-slate-200 focus:ring-slate-400"}`}
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-400">
                  Balance:{" "}
                  <span className={`font-medium tabular-nums ${parsed > fromBal && parsed > 0 ? "text-rose-600" : "text-slate-600"}`}>
                    {fromBal.toFixed(from === "USD" || from === "USDT" ? 2 : 6)} {from}
                  </span>
                </p>
                <button onClick={() => setAmount(String(fromBal))} className="text-xs text-slate-500 font-medium hover:text-slate-800">
                  MAX
                </button>
              </div>
            </div>

            {/* Flip button */}
            <div className="flex justify-center">
              <button
                onClick={handleFlip}
                className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:border-slate-400 hover:text-slate-800 transition-colors"
              >
                <ArrowUpDown size={16} />
              </button>
            </div>

            {/* TO */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">To</label>
              <div className="flex gap-2">
                <select
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="flex-shrink-0 px-3 py-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  {CURRENCIES.filter(c => c !== from).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex-1 px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 tabular-nums">
                  {converted > 0 ? converted.toFixed(8) : "0.00000000"}
                </div>
              </div>
            </div>

            {/* Preview — a ledger, not a blue callout */}
            {parsed > 0 && parsed <= fromBal && (
              <div className="border border-slate-200 rounded-lg px-4 py-3.5 space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Swap preview</p>
                {[
                  ["You send",    `${parsed} ${from}`],
                  ["Fee (2%)",    `${fee.toFixed(8)} ${from} ≈ $${(fee * (rates[from] || 1)).toFixed(2)}`],
                  ["You receive", `${converted.toFixed(8)} ${to}`],
                  ["Rate",        `1 ${from} = ${(rates[from] / rates[to]).toFixed(8)} ${to}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-2.5">
              <Info size={12} className="flex-shrink-0" />
              2% fee deducted from source amount.
            </div>

            <button
              onClick={handleSwap}
              disabled={!canSwap}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium text-sm py-3.5 rounded-lg transition-colors"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <ArrowLeftRight size={15} />
              )}
              {loading ? "Processing…" : `Swap ${from} → ${to}`}
            </button>
          </div>
        </div>

        {/* ── History ───────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden lg:sticky lg:top-6">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <ArrowLeftRight size={14} className="text-slate-500" />
              <p className="text-sm font-medium text-slate-800">Swap history</p>
            </div>
            <div className="px-5">
              {histLoad ? (
                <div className="py-6 space-y-3 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg" />)}
                </div>
              ) : history.length === 0 ? (
                <div className="py-10 text-center">
                  <ArrowLeftRight size={20} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No swaps yet</p>
                </div>
              ) : (
                history.map(s => <HistoryRow key={s._id} swap={s} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}