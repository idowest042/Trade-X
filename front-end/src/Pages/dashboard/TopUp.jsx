import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../../stores/useauthstore";
import api from "../../lib/api";

const DAY_MS = 24 * 60 * 60 * 1000;
export const TOPUP_MIN = 10;
const PLAN_MAX = { starter: 1999, growth: 4999, elite: 19999 }; // mirrors backend

const money = (n) =>
  Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Shared helpers (used by PlansPage and MyInvestments) ────────────────────
export const remainingDays = (inv) =>
  Math.max(0, Math.floor((new Date(inv.endDate) - Date.now()) / DAY_MS));

// Profit earned so far, calculated per contribution so top-ups don't
// retroactively inflate days that already passed.
export const earnedSoFar = (inv) => {
  const rate = inv.roi / 100;
  const contributions = inv.contributions?.length
    ? inv.contributions
    : [{ amount: inv.amount, date: inv.startDate, days: inv.duration }]; // legacy
  const sum = contributions.reduce((total, c) => {
    const elapsed = Math.max(0, Math.floor((Date.now() - new Date(c.date)) / DAY_MS));
    return total + c.amount * rate * Math.min(elapsed, c.days);
  }, 0);
  return Math.min(sum, inv.totalReturn);
};

// ─── Top-up button + modal ────────────────────────────────────────────────────
export default function TopUpButton({ inv, onSuccess }) {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [open, setOpen]     = useState(false);
  const [amount, setAmount] = useState("");
  const [busy, setBusy]     = useState(false);

  const balance = user?.balance ?? 0;
  const days    = remainingDays(inv);
  const max     = PLAN_MAX[inv.planType] ?? Infinity;
  const room    = Math.max(0, Math.round((max - inv.amount) * 100) / 100);

  if (inv.status !== "active" || days < 1) return null;
  if (room < TOPUP_MIN) {
    return <p className="text-xs text-slate-400">Plan maximum reached</p>;
  }

  const parsed     = parseFloat(amount) || 0;
  const extraDaily = parsed * inv.roi / 100;
  const extraTotal = extraDaily * days;

  const error = (() => {
    if (!amount) return null;
    if (parsed < TOPUP_MIN) return `Minimum top-up is $${TOPUP_MIN}.`;
    if (parsed > room)      return `You can add up to $${money(room)} more to this plan.`;
    if (parsed > balance)   return "Insufficient balance.";
    return null;
  })();

  const canSubmit = parsed >= TOPUP_MIN && !error && !busy;

  const close = () => { if (!busy) { setOpen(false); setAmount(""); } };

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    const id = toast.loading("Adding funds…");
    try {
      const { data } = await api.post(`/api/investments/${inv._id}/topup`, { amount: parsed });
      toast.success("Investment increased!", { id, description: data.message });
      if (data.balance != null) updateUser({ balance: data.balance });
      onSuccess?.(data.investment);
      setOpen(false);
      setAmount("");
    } catch (err) {
      toast.error("Top-up failed", {
        id,
        description: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 border border-slate-300 hover:border-slate-900 hover:bg-slate-50 text-slate-800 text-xs font-medium px-3 py-2 rounded-md transition-colors"
      >
        <Plus size={13} />
        Add funds
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-sm bg-white rounded-lg border border-slate-200 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 capitalize">
                  Add funds to {inv.planType} plan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently invested: ${money(inv.amount)}
                </p>
              </div>
              <button onClick={close} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
                Amount to add
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  min={TOPUP_MIN}
                  max={room}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`${TOPUP_MIN} – ${money(room)}`}
                  autoFocus
                  className={`w-full pl-7 pr-3 py-2.5 rounded-md border text-slate-900 text-sm bg-white tabular-nums
                    focus:outline-none focus:ring-1 transition-colors
                    ${error ? "border-rose-300 focus:ring-rose-400" : "border-slate-200 focus:ring-slate-400 focus:border-slate-400"}`}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Available: ${money(balance)}</span>
                <span>Room left: ${money(room)}</span>
              </div>
              {error && (
                <p className="flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertCircle size={11} />
                  {error}
                  {error === "Insufficient balance." && (
                    <button
                      onClick={() => navigate("/dashboard/deposit")}
                      className="underline font-medium ml-1"
                    >
                      Deposit
                    </button>
                  )}
                </p>
              )}
            </div>

            {parsed >= TOPUP_MIN && !error && (
              <div className="border border-slate-200 rounded-md px-4 py-3 space-y-1.5">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  What you'll gain
                </p>
                {[
                  ["Extra daily return", `+$${money(extraDaily)}`],
                  [`Extra profit (${days} days left)`, `+$${money(extraTotal)}`],
                  ["New total profit", `$${money(inv.totalReturn + extraTotal)}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Added funds earn for the {days} remaining day{days !== 1 ? "s" : ""} only. The end
              date doesn't change, and the profit you've already earned is unaffected.
            </p>

            <button
              onClick={submit}
              disabled={!canSubmit}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-3 rounded-md transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {busy ? "Processing…" : parsed >= TOPUP_MIN && !error ? `Add $${money(parsed)}` : "Add funds"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}