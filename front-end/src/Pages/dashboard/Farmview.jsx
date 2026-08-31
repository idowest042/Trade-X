import { useState, useEffect, useMemo } from "react";
import { Sprout, X, Loader2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

const CATEGORIES = [
  { id: "all",    label: "All" },
  { id: "gold",   label: "💰 Gold" },
  { id: "stocks", label: "📈 Stocks" },
  { id: "new",    label: "🆕 New coin" },
];

const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;

// Mirrors the exact formula in Controllers/farmController.js so the number
// shown here matches what the backend will actually pay out on unstake.
function liveAccrued(position, now) {
  if (position.status !== "active") return position.finalReward || position.accruedReward || 0;
  const elapsedMs = now - new Date(position.stakedAt).getTime();
  const reward = (position.amount * (position.aprAtStake / 100) * elapsedMs) / MS_PER_YEAR;
  return Math.max(0, reward);
}

export default function FarmView({ balance, onBalanceChange }) {
  const [pools, setPools]           = useState([]);
  const [positions, setPositions]   = useState([]);
  const [category, setCategory]     = useState("all");
  const [loadingPools, setLoadingPools] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [stakeTarget, setStakeTarget] = useState(null); // pool being staked into
  const [stakeAmount, setStakeAmount] = useState("");
  const [staking, setStaking]       = useState(false);
  const [unstakingId, setUnstakingId] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchPools = async (cat) => {
    setLoadingPools(true);
    try {
      const { data } = await api.get("/api/farm/pools", { params: cat !== "all" ? { category: cat } : {} });
      setPools(data.pools || []);
    } catch {
      toast.error("Couldn't load farm pools");
    } finally {
      setLoadingPools(false);
    }
  };

  const fetchPositions = async () => {
    setLoadingPositions(true);
    try {
      const { data } = await api.get("/api/farm/my-positions");
      setPositions(data.positions || []);
    } catch {
      toast.error("Couldn't load your farm positions");
    } finally {
      setLoadingPositions(false);
    }
  };

  useEffect(() => { fetchPools(category); }, [category]); // eslint-disable-line
  useEffect(() => { fetchPositions(); }, []);

  const activePositions = useMemo(() => positions.filter((p) => p.status === "active"), [positions]);
  const totalStaked  = useMemo(() => activePositions.reduce((s, p) => s + p.amount, 0), [activePositions]);
  const totalAccrued = useMemo(() => activePositions.reduce((s, p) => s + liveAccrued(p, now), 0), [activePositions, now]);

  const openStakeModal = (pool) => { setStakeTarget(pool); setStakeAmount(""); };

  const submitStake = async () => {
    const amt = parseFloat(stakeAmount);
    if (!amt || amt < stakeTarget.minStake) {
      toast.error(`Minimum stake for this pool is $${stakeTarget.minStake}`);
      return;
    }
    if (amt > balance) {
      toast.error("Insufficient balance");
      return;
    }
    setStaking(true);
    const tid = toast.loading("Staking…");
    try {
      const { data } = await api.post("/api/farm/stake", { poolId: stakeTarget._id, amount: amt });
      toast.success("Staked!", { id: tid, description: `$${amt.toFixed(2)} into ${stakeTarget.pairLabel}` });
      onBalanceChange((b) => parseFloat((b - amt).toFixed(2)));
      setStakeTarget(null);
      fetchPositions();
    } catch (err) {
      toast.error("Failed to stake", { id: tid, description: err.response?.data?.message });
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async (position) => {
    setUnstakingId(position._id);
    const tid = toast.loading("Unstaking…");
    try {
      const { data } = await api.post("/api/farm/unstake", { positionId: position._id });
      const reward = data.position?.finalReward ?? 0;
      toast.success("Unstaked!", { id: tid, description: `+$${reward.toFixed(2)} reward` });
      onBalanceChange(() => data.newBalance);
      fetchPositions();
    } catch (err) {
      toast.error("Failed to unstake", { id: tid, description: err.response?.data?.message });
    } finally {
      setUnstakingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      {activePositions.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-1.5">Total Staked</p>
            <p className="text-xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>${totalStaked.toFixed(2)}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-500 mb-1.5">Accrued Rewards</p>
            <p className="text-xl font-extrabold text-green-400" style={{ fontFamily: "'Sora', sans-serif" }}>+${totalAccrued.toFixed(4)}</p>
          </div>
        </div>
      )}

      {/* My positions */}
      {loadingPositions ? null : activePositions.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center gap-2">
            <Sprout size={14} className="text-green-400" />
            <p className="text-sm font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>My Staked Positions</p>
          </div>
          <div className="divide-y divide-slate-800/60">
            {activePositions.map((p) => (
              <div key={p._id} className="flex items-center justify-between px-5 py-3.5 gap-4 flex-wrap">
                <div>
                  <p className="font-bold text-slate-100 text-sm">{p.poolId?.pairLabel || "—"}</p>
                  <p className="text-xs text-slate-500">{p.poolId?.provider} · {p.aprAtStake}% APR</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-200">${p.amount.toFixed(2)} staked</p>
                  <p className="text-xs text-green-400 font-semibold">+${liveAccrued(p, now).toFixed(4)} earned</p>
                </div>
                <button onClick={() => handleUnstake(p)} disabled={unstakingId === p._id}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 px-3.5 py-2 rounded-lg transition-all disabled:opacity-50">
                  {unstakingId === p._id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                  {unstakingId === p._id ? "Unstaking…" : "Unstake"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
              ${category === c.id ? "bg-slate-700 text-white" : "bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Pools */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-2.5 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <span>Pool</span><span className="text-right">APR</span><span className="text-right">Min Stake</span><span />
        </div>
        {loadingPools ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading pools…</div>
        ) : pools.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">No pools in this category yet.</div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {pools.map((pool) => (
              <div key={pool._id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 px-4 py-3.5 items-center">
                <div>
                  <p className="font-bold text-slate-100 text-sm">{pool.pairLabel}</p>
                  <p className="text-xs text-slate-500">{pool.provider}</p>
                </div>
                <span className="text-right text-sm font-bold text-green-400 flex items-center justify-end gap-1">
                  <TrendingUp size={12} />{pool.apr}%
                </span>
                <span className="text-right text-sm text-slate-400">${pool.minStake}</span>
                <button onClick={() => openStakeModal(pool)}
                  className="justify-self-end text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-all">
                  Stake
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stake modal */}
      {stakeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{stakeTarget.pairLabel}</p>
                <p className="text-xs text-slate-500">{stakeTarget.provider} · {stakeTarget.apr}% APR</p>
              </div>
              <button onClick={() => setStakeTarget(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
                <span>Amount (USD)</span><span>Bal: ${balance.toFixed(2)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input type="number" min={stakeTarget.minStake} value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder={`${stakeTarget.minStake}.00`}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <p className="text-[10px] text-slate-500">Minimum stake: ${stakeTarget.minStake}</p>
            </div>

            <button onClick={submitStake} disabled={staking}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-all disabled:opacity-50">
              {staking ? "Staking…" : `Stake into ${stakeTarget.pairLabel}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}