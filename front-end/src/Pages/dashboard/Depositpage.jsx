import { useState, useEffect, useRef } from "react";
import {
  Copy,
  CheckCheck,
  Upload,
  ImageIcon,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Wallet,
  ArrowDownToLine,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

// ─── Wallet config ────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: "usdt_trc20",
    label: "USDT (TRC20)",
    network: "TRON Network",
    symbol: "USDT",
    chain: "TRC20",
    address: "TEJQprY9E4d2Zjxmki8cvqDn1niPjqDPao",
    note: "Only send USDT via the TRON (TRC20) network to this address.",
  },
  {
    id: "usdt_erc20",
    label: "USDT (ERC20)",
    network: "Ethereum Network",
    symbol: "USDT",
    chain: "ERC20",
    address: "0x831ebd380335ba80d5474f7b93c4c2a9538ca0e3",
    note: "Only send USDT via the Ethereum (ERC20) network to this address.",
  },
  {
    id: "usdt_bep20",
    label: "USDT (BEP20)",
    network: "BNB Smart Chain",
    symbol: "USDT",
    chain: "BEP20",
    address: "0x831ebd380335ba80d5474f7b93c4c2a9538ca0e3",
    note: "Only send USDT via the BNB Smart Chain (BEP20) network.",
  },
  {
    id: "btc",
    label: "Bitcoin (BTC)",
    network: "Bitcoin Network",
    symbol: "BTC",
    chain: "Native",
    address: "1NbZjyJHGLjowXKYPQqRaHc7TuAFbEAZQs",
    note: "Only send BTC via the native Bitcoin network to this address.",
  },
  {
    id: "eth",
    label: "Ethereum (ETH)",
    network: "Ethereum Network",
    symbol: "ETH",
    chain: "ERC20",
    address: "0x831ebd380335ba80d5474f7b93c4c2a9538ca0e3",
    note: "Only send ETH via the Ethereum network to this address.",
  },
  {
    id: "sol",
    label: "Solana (SOL)",
    network: "Solana Network",
    symbol: "SOL",
    chain: "SOL",
    address: "3Ku84z3tqNUzBK9tFj3Q8Tg4ivdn78thKmeUF56WWEYK",
    note: "Only send SOL via the Solana network to this address.",
  },
];

const money = (n) => Number(n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "bg-amber-50 text-amber-700 border-amber-200",  label: "Pending"  },
    approved: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Approved" },
    rejected: { cls: "bg-rose-50 text-rose-600 border-rose-200",     label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}

function DepositRow({ deposit }) {
  const method = PAYMENT_METHODS.find((m) => m.id === deposit.method);
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center flex-shrink-0">
          <ArrowDownToLine size={14} className="text-slate-500" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {method?.label || deposit.method}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(deposit.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <p className="text-sm font-semibold text-slate-800 tabular-nums">
          ${money(deposit.amount)}
        </p>
        <StatusBadge status={deposit.status} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DepositPage() {
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get("/api/deposits/my")
      .then(({ data }) => setDeposits(data.deposits || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedMethod.address);
    setCopied(true);
    toast.success("Address copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Max file size is 5MB." });
      return;
    }
    setProofFile(file);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Invalid amount", { description: "Please enter a valid deposit amount." });
      return;
    }
    if (!proofFile) {
      toast.error("Proof required", { description: "Please upload your payment screenshot." });
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting your deposit…");

    try {
      const fd = new FormData();
      fd.append("amount", amount);
      fd.append("method", selectedMethod.id);
      fd.append("walletAddress", selectedMethod.address);
      fd.append("proofImage", proofFile);

      const { data } = await api.post("/api/deposits/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Deposit submitted!", {
        id: toastId,
        description: "Awaiting admin confirmation. Your balance will update once approved.",
      });

      setDeposits((prev) => [data.deposit, ...prev]);
      setStep(1);
      setSelectedMethod(null);
      setAmount("");
      setProofFile(null);
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      toast.error("Submission failed", { id: toastId, description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Deposit funds</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Select a payment method, send funds to the address shown, then upload your proof.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Left: form flow ─────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {["Select method", "Payment & proof"].map((label, i) => {
              const s = i + 1;
              const active = step >= s;
              const done = step > s;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 border
                    ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200"}`}>
                    {done ? <CheckCheck size={11} /> : s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-slate-800" : "text-slate-400"}`}>
                    {label}
                  </span>
                  {s < 2 && <div className={`w-6 h-px ${step > s ? "bg-slate-400" : "bg-slate-200"}`} />}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1 ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-800">Choose payment method</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select the cryptocurrency you want to deposit with.
                </p>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMethod(m); setStep(2); }}
                    className="flex items-center gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-700 text-[11px] font-semibold tracking-tight">
                        {m.symbol}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{m.label}</p>
                      <p className="text-xs text-slate-400">{m.network}</p>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────────── */}
          {step === 2 && selectedMethod && (
            <div className="space-y-4">

              <button
                onClick={() => { setStep(1); setProofFile(null); setAmount(""); }}
                className="text-sm text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Change method
              </button>

              {/* Amount card */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-700 text-[11px] font-semibold">{selectedMethod.symbol}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{selectedMethod.label}</p>
                    <p className="text-xs text-slate-400">{selectedMethod.network}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-colors"
                    />
                  </div>
                  {amount && Number(amount) > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      You are depositing{" "}
                      <span className="font-semibold text-slate-800 tabular-nums">
                        ${Number(amount).toLocaleString()}
                      </span>{" "}
                      using <span className="font-medium">{selectedMethod.label}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Wallet address card */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
                <p className="text-sm font-medium text-slate-800">Send payment to</p>

                <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <p className="flex-1 text-xs font-mono text-slate-700 break-all leading-relaxed">
                    {selectedMethod.address}
                  </p>
                  <button
                    onClick={handleCopy}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors mt-0.5
                      ${copied ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
                  >
                    {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-4 py-2.5">
                  <span className="text-slate-500">Network</span>
                  <span className="font-medium text-slate-700">{selectedMethod.chain}</span>
                </div>

                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {selectedMethod.note}{" "}
                    <strong>Wrong network = permanent loss of funds.</strong>
                  </p>
                </div>
              </div>

              {/* Proof upload card */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">Upload payment proof</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Take a screenshot of the completed transaction and upload it below.
                  </p>
                </div>

                {proofFile ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={URL.createObjectURL(proofFile)}
                      alt="proof preview"
                      className="w-full max-h-52 object-cover"
                    />
                    <button
                      onClick={() => { setProofFile(null); fileRef.current.value = ""; }}
                      className="absolute top-2 right-2 w-7 h-7 bg-slate-900/80 hover:bg-slate-900 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                      <X size={13} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 px-3 py-2">
                      <p className="text-white text-xs truncate">{proofFile.name}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer flex flex-col items-center gap-2 py-9 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-md border border-slate-200 bg-white flex items-center justify-center">
                      <ImageIcon size={16} className="text-slate-400" strokeWidth={1.75} />
                    </div>
                    <p className="text-sm font-medium text-slate-600">Click to upload screenshot</p>
                    <p className="text-xs text-slate-400">JPG or PNG — max 5MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm py-3.5 rounded-lg transition-colors"
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
                  <><Upload size={15} /> Submit deposit</>
                )}
              </button>

              <p className="text-xs text-center text-slate-400">
                Deposits are manually reviewed. Balance updates within 30 min of approval.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: deposit history ────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden lg:sticky lg:top-6">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Wallet size={14} className="text-slate-500" strokeWidth={1.75} />
              <p className="text-sm font-medium text-slate-800">Deposit history</p>
            </div>
            <div className="px-5">
              {loadingHistory ? (
                <div className="py-6 space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-md flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : deposits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center mb-3">
                    <ArrowDownToLine size={16} className="text-slate-400" strokeWidth={1.75} />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No deposits yet</p>
                  <p className="text-xs text-slate-400 mt-1">Your deposit history will appear here.</p>
                </div>
              ) : (
                deposits.map((d) => <DepositRow key={d._id} deposit={d} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}