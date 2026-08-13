import { useState, useEffect } from "react";
import {
  ArrowUpFromLine,
  ShieldAlert,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../../stores/useauthstore";
import api from "../../lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_WITHDRAWAL = 10000;

const CRYPTO_METHODS = [
  { id: "usdt_trc20", label: "USDT (TRC20)", network: "TRON Network",    color: "bg-green-500"  },
  { id: "usdt_erc20", label: "USDT (ERC20)", network: "Ethereum Network", color: "bg-blue-500"   },
  { id: "usdt_bep20", label: "USDT (BEP20)", network: "BNB Smart Chain",  color: "bg-yellow-500" },
  { id: "btc",        label: "Bitcoin (BTC)", network: "Bitcoin Network",  color: "bg-orange-500" },
  { id: "eth",        label: "Ethereum (ETH)",network: "Ethereum Network", color: "bg-indigo-500" },
  { id: "sol",        label: "Solana (SOL)",  network: "Solana Network",   color: "bg-purple-500" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "bg-amber-100 text-amber-700", label: "Pending"  },
    approved: { cls: "bg-green-100 text-green-700", label: "Approved" },
    rejected: { cls: "bg-red-100   text-red-600",   label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s.cls}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {s.label}
    </span>
  );
}

function WithdrawalRow({ w }) {
  const method = CRYPTO_METHODS.find(m => m.id === w.method);
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${method?.color || "bg-slate-300"}`}>
          <ArrowUpFromLine size={14} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {method?.label || w.method}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[130px]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {w.walletAddress}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm font-bold text-slate-800"
          style={{ fontFamily: "'Sora', sans-serif" }}>
          ${Number(w.amount).toLocaleString()}
        </p>
        <StatusBadge status={w.status} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WithdrawPage() {
  const { user } = useAuthStore();

  const [kycStatus, setKycStatus]           = useState(null);   // null | "pending" | "approved" | "rejected"
  const [kycLoading, setKycLoading]         = useState(true);
  const [withdrawals, setWithdrawals]       = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [form, setForm] = useState({
    amount: "",
    method: "usdt_trc20",
    walletAddress: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const balance         = user?.balance ?? 0;
  const kycApproved     = kycStatus === "approved";
  const parsedAmount    = parseFloat(form.amount) || 0;

  // ── Validation errors (live)
  const amountErrors = (() => {
    if (!form.amount) return null;
    if (parsedAmount <= 0)             return "Enter a valid amount.";
    if (parsedAmount > MAX_WITHDRAWAL) return `Max withdrawal is $${MAX_WITHDRAWAL.toLocaleString()}.`;
    if (parsedAmount > balance)        return "Insufficient balance.";
    return null;
  })();

  const canSubmit =
    kycApproved &&
    form.amount &&
    !amountErrors &&
    form.walletAddress.trim().length > 5 &&
    !submitting;

  // ── Fetch KYC status + history on mount
  useEffect(() => {
    const fetchKyc = async () => {
      try {
        const { data } = await api.get("/api/kyc/me");
        setKycStatus(data.kyc?.status || null);
      } catch {
        setKycStatus(null);
      } finally {
        setKycLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/api/withdrawals/my");
        setWithdrawals(data.withdrawals || []);
      } catch {
        // silent
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchKyc();
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    const toastId = toast.loading("Submitting withdrawal request…");

    try {
      const { data } = await api.post("/api/withdrawals/request", {
        amount:        parsedAmount,
        method:        form.method,
        walletAddress: form.walletAddress.trim(),
      });

      toast.success("Withdrawal submitted!", {
        id: toastId,
        description: "Your request is pending approval. Funds will be sent once confirmed.",
      });

      setWithdrawals(prev => [data.withdrawal, ...prev]);
      setForm(prev => ({ ...prev, amount: "", walletAddress: "" }));
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      toast.error("Request failed", { id: toastId, description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Balance meter fill %
  const balanceFill = Math.min((parsedAmount / Math.max(balance, 1)) * 100, 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900"
            style={{ fontFamily: "'Sora', sans-serif" }}>
            Withdraw Funds
          </h1>
          <p className="text-sm text-slate-500 mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Request a crypto withdrawal. All requests are reviewed and processed by our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: form ───────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* KYC not approved — block */}
            {!kycLoading && !kycApproved && (
              <div className={`flex items-start gap-3 rounded-2xl border p-5
                ${kycStatus === "pending"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"}`}>
                <ShieldAlert size={20} className={`flex-shrink-0 mt-0.5
                  ${kycStatus === "pending" ? "text-amber-500" : "text-red-500"}`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800 mb-1"
                    style={{ fontFamily: "'Sora', sans-serif" }}>
                    {kycStatus === "pending"
                      ? "KYC Verification Pending"
                      : "Identity Verification Required"}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {kycStatus === "pending"
                      ? "Your KYC application is under review. Withdrawals will be enabled once your identity is verified."
                      : "You must complete identity verification before making withdrawals. This protects your account and complies with our KYC/AML policy."}
                  </p>
                  {!kycStatus && (
                    <a href="/dashboard/kyc"
                      className="inline-block mt-3 text-xs font-semibold text-blue-600 hover:underline"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Complete KYC verification →
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Balance card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Wallet size={15} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Available Balance
                  </p>
                </div>
                <p className="text-xl font-bold text-slate-900"
                  style={{ fontFamily: "'Sora', sans-serif" }}>
                  ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Balance usage bar */}
              {parsedAmount > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <span>Withdrawal amount</span>
                    <span className={parsedAmount > balance ? "text-red-500 font-semibold" : "text-slate-600"}>
                      ${parsedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        parsedAmount > balance ? "bg-red-400" : "bg-blue-500"
                      }`}
                      style={{ width: `${balanceFill}%` }}
                    />
                  </div>
                  {parsedAmount <= balance && (
                    <p className="text-xs text-slate-400"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Remaining after withdrawal:{" "}
                      <span className="font-semibold text-slate-600">
                        ${(balance - parsedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Withdrawal form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-5">
              <p className="text-sm font-semibold text-slate-800"
                style={{ fontFamily: "'Sora', sans-serif" }}>
                Withdrawal Details
              </p>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Amount (USD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                  <input
                    type="number"
                    name="amount"
                    min="1"
                    max={MAX_WITHDRAWAL}
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    disabled={!kycApproved}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border text-slate-900 text-sm bg-slate-50
                      focus:outline-none focus:ring-2 focus:bg-white transition-all
                      disabled:opacity-60 disabled:cursor-not-allowed
                      ${amountErrors
                        ? "border-red-300 focus:ring-red-400"
                        : "border-slate-200 focus:ring-blue-500 focus:border-transparent"
                      }`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
                {amountErrors && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <AlertCircle size={12} />
                    {amountErrors}
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-xs text-slate-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <Info size={11} />
                  Maximum withdrawal per request: ${MAX_WITHDRAWAL.toLocaleString()}
                </p>
              </div>

              {/* Crypto method */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Withdrawal Method <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CRYPTO_METHODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!kycApproved}
                      onClick={() => setForm(prev => ({ ...prev, method: m.id }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${form.method === m.id
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex-shrink-0 ${m.color}`} />
                      <span className="text-xs font-semibold truncate"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet address */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Your Wallet Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={form.walletAddress}
                  onChange={handleChange}
                  disabled={!kycApproved}
                  placeholder="Enter your wallet address"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: "monospace" }}
                />
                <p className="flex items-center gap-1.5 text-xs text-slate-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <AlertCircle size={11} />
                  Double-check your address. Withdrawals to incorrect addresses cannot be reversed.
                </p>
              </div>

              {/* Summary box */}
              {parsedAmount > 0 && !amountErrors && form.walletAddress.trim().length > 5 && kycApproved && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3.5 space-y-2">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Withdrawal Summary
                  </p>
                  {[
                    ["Amount",  `$${parsedAmount.toLocaleString()}`],
                    ["Method",  CRYPTO_METHODS.find(m => m.id === form.method)?.label],
                    ["Address", `${form.walletAddress.slice(0, 12)}…${form.walletAddress.slice(-6)}`],
                    ["Status",  "Pending admin review"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      <span className="text-blue-500">{k}</span>
                      <span className="font-semibold text-blue-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-200 disabled:shadow-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <><ArrowUpFromLine size={15} /> Submit Withdrawal Request</>
                )}
              </button>
            </form>
          </div>

          {/* ── Right: history ────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-6">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <ArrowUpFromLine size={15} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-800"
                  style={{ fontFamily: "'Sora', sans-serif" }}>
                  Withdrawal History
                </p>
              </div>

              <div className="px-5">
                {historyLoading ? (
                  <div className="py-6 space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-100 rounded w-3/4" />
                          <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                      <ArrowUpFromLine size={18} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      No withdrawals yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Your withdrawal history will appear here.
                    </p>
                  </div>
                ) : (
                  withdrawals.map(w => <WithdrawalRow key={w._id} w={w} />)
                )}
              </div>

              {/* Info footer */}
              <div className="px-5 pb-4 pt-2">
                <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
                  {[
                    { icon: Clock,        color: "text-amber-500", text: "Pending — awaiting review"       },
                    { icon: CheckCircle2, color: "text-green-500", text: "Approved — funds sent to your wallet" },
                    { icon: XCircle,      color: "text-red-500",   text: "Rejected — request was declined"      },
                  ].map(({ icon: Icon, color, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon size={12} className={`flex-shrink-0 ${color}`} />
                      <p className="text-xs text-slate-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}