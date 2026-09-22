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
  { id: "usdt_trc20", label: "USDT", tag: "TRC20", network: "TRON Network"     },
  { id: "usdt_erc20", label: "USDT", tag: "ERC20", network: "Ethereum Network" },
  { id: "usdt_bep20", label: "USDT", tag: "BEP20", network: "BNB Smart Chain"  },
  { id: "btc",        label: "Bitcoin",  tag: "BTC", network: "Bitcoin Network"   },
  { id: "eth",        label: "Ethereum", tag: "ETH", network: "Ethereum Network" },
  { id: "sol",        label: "Solana",   tag: "SOL", network: "Solana Network"   },
];

const money = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "bg-amber-50 text-amber-700 border-amber-200",      label: "Pending"  },
    approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approved" },
    rejected: { cls: "bg-rose-50 text-rose-700 border-rose-200",         label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}

function WithdrawalRow({ w }) {
  const method = CRYPTO_METHODS.find(m => m.id === w.method);
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center flex-shrink-0">
          <ArrowUpFromLine size={13} className="text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {method?.label || w.method}
            {method?.tag && <span className="text-slate-400 font-normal"> · {method.tag}</span>}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[150px] font-mono">
            {w.walletAddress}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <p className="text-sm font-semibold text-slate-800 tabular-nums">
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

  const [kycStatus, setKycStatus]           = useState(null);
  const [kycLoading, setKycLoading]         = useState(true);
  const [withdrawals, setWithdrawals]       = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const [form, setForm] = useState({
    amount: "",
    method: "usdt_trc20",
    walletAddress: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const balance      = user?.balance ?? 0;
  const kycApproved  = kycStatus === "approved";
  const parsedAmount = parseFloat(form.amount) || 0;

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

  const balanceFill = Math.min((parsedAmount / Math.max(balance, 1)) * 100, 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Withdraw funds</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Request a crypto withdrawal. All requests are reviewed and processed by our team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: form ───────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* KYC not approved — block */}
          {!kycLoading && !kycApproved && (
            <div className={`flex items-start gap-3 rounded-lg border-l-2 p-5
              ${kycStatus === "pending" ? "border-amber-400 bg-amber-50/60" : "border-rose-500 bg-rose-50/60"}`}>
              <ShieldAlert size={18} className={`flex-shrink-0 mt-0.5 ${kycStatus === "pending" ? "text-amber-500" : "text-rose-500"}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {kycStatus === "pending" ? "KYC verification pending" : "Identity verification required"}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {kycStatus === "pending"
                    ? "Your KYC application is under review. Withdrawals will be enabled once your identity is verified."
                    : "You must complete identity verification before making withdrawals. This protects your account and complies with our KYC/AML policy."}
                </p>
                {!kycStatus && (
                  <a href="/dashboard/kyc" className="inline-block mt-3 text-xs font-medium text-slate-700 hover:text-slate-900 underline">
                    Complete KYC verification →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Balance card */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-slate-400" />
                <p className="text-sm font-medium text-slate-600">Available balance</p>
              </div>
              <p className="text-xl font-semibold text-slate-900 tabular-nums">
                ${money(balance)}
              </p>
            </div>

            {parsedAmount > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Withdrawal amount</span>
                  <span className={`tabular-nums ${parsedAmount > balance ? "text-rose-600 font-semibold" : "text-slate-600"}`}>
                    ${parsedAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${parsedAmount > balance ? "bg-rose-400" : "bg-slate-900"}`}
                    style={{ width: `${balanceFill}%` }}
                  />
                </div>
                {parsedAmount <= balance && (
                  <p className="text-xs text-slate-400">
                    Remaining after withdrawal:{" "}
                    <span className="font-medium text-slate-600 tabular-nums">
                      ${money(balance - parsedAmount)}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Withdrawal form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-5 space-y-5">
            <p className="text-sm font-medium text-slate-800">Withdrawal details</p>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Amount (USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  max={MAX_WITHDRAWAL}
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  disabled={!kycApproved}
                  className={`w-full pl-8 pr-4 py-3 rounded-lg border text-slate-900 text-sm bg-white tabular-nums
                    focus:outline-none focus:ring-1 transition-colors
                    disabled:opacity-60 disabled:cursor-not-allowed
                    ${amountErrors ? "border-rose-300 focus:ring-rose-400" : "border-slate-200 focus:ring-slate-400 focus:border-slate-400"}`}
                />
              </div>
              {amountErrors && (
                <p className="flex items-center gap-1.5 text-xs text-rose-600">
                  <AlertCircle size={12} />
                  {amountErrors}
                </p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <Info size={11} />
                Maximum withdrawal per request: ${MAX_WITHDRAWAL.toLocaleString()}
              </p>
            </div>

            {/* Crypto method */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Withdrawal method <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CRYPTO_METHODS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!kycApproved}
                    onClick={() => setForm(prev => ({ ...prev, method: m.id }))}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${form.method === m.id
                        ? "border-slate-900 bg-slate-50 text-slate-900"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                  >
                    <span className="text-xs font-medium truncate">
                      {m.label} <span className="text-slate-400">· {m.tag}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet address */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Your wallet address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="walletAddress"
                value={form.walletAddress}
                onChange={handleChange}
                disabled={!kycApproved}
                placeholder="Enter your wallet address"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="flex items-center gap-1.5 text-xs text-slate-400">
                <AlertCircle size={11} />
                Double-check your address. Withdrawals to incorrect addresses cannot be reversed.
              </p>
            </div>

            {/* Summary box */}
            {parsedAmount > 0 && !amountErrors && form.walletAddress.trim().length > 5 && kycApproved && (
              <div className="border border-slate-200 rounded-lg px-4 py-3.5 space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Withdrawal summary</p>
                {[
                  ["Amount",  `$${parsedAmount.toLocaleString()}`],
                  ["Method",  `${CRYPTO_METHODS.find(m => m.id === form.method)?.label} (${CRYPTO_METHODS.find(m => m.id === form.method)?.tag})`],
                  ["Address", `${form.walletAddress.slice(0, 12)}…${form.walletAddress.slice(-6)}`],
                  ["Status",  "Pending admin review"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium text-sm py-3.5 rounded-lg transition-colors"
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
                <><ArrowUpFromLine size={15} /> Submit withdrawal request</>
              )}
            </button>
          </form>
        </div>

        {/* ── Right: history ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden lg:sticky lg:top-6">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <ArrowUpFromLine size={14} className="text-slate-500" />
              <p className="text-sm font-medium text-slate-800">Withdrawal history</p>
            </div>

            <div className="px-5">
              {historyLoading ? (
                <div className="py-6 space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-md flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 rounded-md border border-slate-200 flex items-center justify-center mb-3">
                    <ArrowUpFromLine size={17} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No withdrawals yet</p>
                  <p className="text-xs text-slate-400 mt-1">Your withdrawal history will appear here.</p>
                </div>
              ) : (
                withdrawals.map(w => <WithdrawalRow key={w._id} w={w} />)
              )}
            </div>

            {/* Info footer */}
            <div className="px-5 pb-5 pt-2">
              <div className="border border-slate-100 rounded-lg px-4 py-3 space-y-1.5">
                {[
                  { icon: Clock,        color: "text-amber-500",   text: "Pending — awaiting review"             },
                  { icon: CheckCircle2, color: "text-emerald-500", text: "Approved — funds sent to your wallet"  },
                  { icon: XCircle,      color: "text-rose-500",    text: "Rejected — request was declined"       },
                ].map(({ icon: Icon, color, text }) => (
                  <div key={text} className="flex items-center gap-2">
                    <Icon size={12} className={`flex-shrink-0 ${color}`} />
                    <p className="text-xs text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}