import { useState, useEffect, useRef } from "react";
import {
  Copy,
  CheckCheck,
  Upload,
  ImageIcon,
  X,
  ChevronRight,
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
    address: "TY1towm5Sd3SrX1Um6VPs8HRfkm7NprHnK",
    color: "bg-green-500",
    note: "Only send USDT via the TRON (TRC20) network to this address.",
  },
  {
    id: "usdt_erc20",
    label: "USDT (ERC20)",
    network: "Ethereum Network",
    symbol: "USDT",
    chain: "ERC20",
    address: "0xEaC3a0A245938b4D8C7d6A774A2D33A655dddAF0",
    color: "bg-blue-500",
    note: "Only send USDT via the Ethereum (ERC20) network to this address.",
  },
  {
    id: "usdt_bep20",
    label: "USDT (BEP20)",
    network: "BNB Smart Chain",
    symbol: "USDT",
    chain: "BEP20",
    address: "0xEaC3a0A245938b4D8C7d6A774A2D33A655dddAF0",
    color: "bg-yellow-500",
    note: "Only send USDT via the BNB Smart Chain (BEP20) network.",
  },
  {
    id: "btc",
    label: "Bitcoin (BTC)",
    network: "Bitcoin Network",
    symbol: "BTC",
    chain: "Native",
    address: "bc1qw2je5r882n3cgnmm4ekgp6ml25p3n69e924p0e",
    color: "bg-orange-500",
    note: "Only send BTC via the native Bitcoin network to this address.",
  },
  {
    id: "eth",
    label: "Ethereum (ETH)",
    network: "Ethereum Network",
    symbol: "ETH",
    chain: "ERC20",
    address: "0xEaC3a0A245938b4D8C7d6A774A2D33A655dddAF0",
    color: "bg-indigo-500",
    note: "Only send ETH via the Ethereum network to this address.",
  },
  {
    id: "sol",
    label: "Solana (SOL)",
    network: "Solana Network",
    symbol: "SOL",
    chain: "SOL",
    address: "4fSYs25hBDTPStmN4TJvfE9N8BcpDEmHyUTNNd37JHqs",
    color: "bg-purple-500",
    note: "Only send SOL via the Solana network to this address.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "bg-amber-100 text-amber-700",  label: "Pending"  },
    approved: { cls: "bg-green-100 text-green-700",  label: "Approved" },
    rejected: { cls: "bg-red-100   text-red-600",    label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s.cls}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {s.label}
    </span>
  );
}

function DepositRow({ deposit }) {
  const method = PAYMENT_METHODS.find(m => m.id === deposit.method);
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${method?.color || "bg-slate-300"}`}>
          <ArrowDownToLine size={14} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {method?.label || deposit.method}
          </p>
          <p className="text-xs text-slate-400 mt-0.5"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {new Date(deposit.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm font-bold text-slate-800"
          style={{ fontFamily: "'Sora', sans-serif" }}>
          ${Number(deposit.amount).toLocaleString()}
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

      setDeposits(prev => [data.deposit, ...prev]);
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900"
            style={{ fontFamily: "'Sora', sans-serif" }}>
            Deposit Funds
          </h1>
          <p className="text-sm text-slate-500 mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Select a payment method, send funds to the address shown, then upload your proof.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: form flow ─────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Step pills */}
            <div className="flex items-center gap-3">
              {["Select Method", "Payment & Proof"].map((label, i) => {
                const s = i + 1;
                const active = step >= s;
                const done = step > s;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${active ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400"}`}
                      style={{ fontFamily: "'Sora', sans-serif" }}>
                      {done ? <CheckCheck size={12} /> : s}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${active ? "text-blue-600" : "text-slate-400"}`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {label}
                    </span>
                    {s < 2 && <div className={`w-6 h-px ${step > s ? "bg-blue-400" : "bg-slate-200"}`} />}
                  </div>
                );
              })}
            </div>

            {/* ── STEP 1 ─────────────────────────────────────────────── */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-slate-100">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800"
                    style={{ fontFamily: "'Sora', sans-serif" }}>
                    Choose Payment Method
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Select the cryptocurrency you want to deposit with.
                  </p>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedMethod(m); setStep(2); }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/40 transition-all text-left group">
                      <div className={`w-9 h-9 rounded-xl ${m.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-bold"
                          style={{ fontFamily: "'Sora', sans-serif" }}>
                          {m.symbol}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {m.label}
                        </p>
                        <p className="text-xs text-slate-400"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {m.network}
                        </p>
                      </div>
                      <ChevronRight size={15} className="text-slate-300 group-hover:text-blue-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2 ─────────────────────────────────────────────── */}
            {step === 2 && selectedMethod && (
              <div className="space-y-4">

                {/* Back */}
                <button onClick={() => { setStep(1); setProofFile(null); setAmount(""); }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  ← Change method
                </button>

                {/* Amount card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${selectedMethod.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-xs font-bold">{selectedMethod.symbol}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800"
                        style={{ fontFamily: "'Sora', sans-serif" }}>
                        {selectedMethod.label}
                      </p>
                      <p className="text-xs text-slate-400"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {selectedMethod.network}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
                      <input
                        type="number"
                        min="1"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                    </div>
                    {amount && Number(amount) > 0 && (
                      <p className="text-xs text-slate-500 mt-2"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        You are depositing{" "}
                        <span className="font-bold text-blue-600">
                          ${Number(amount).toLocaleString()}
                        </span>{" "}
                        using <span className="font-semibold">{selectedMethod.label}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Wallet address card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-800"
                    style={{ fontFamily: "'Sora', sans-serif" }}>
                    Send Payment To
                  </p>

                  <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <p className="flex-1 text-xs font-mono text-slate-700 break-all leading-relaxed">
                      {selectedMethod.address}
                    </p>
                    <button
                      onClick={handleCopy}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all mt-0.5
                        ${copied ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-50 rounded-xl px-4 py-2.5"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <span className="text-slate-500">Network</span>
                    <span className="font-semibold text-slate-700">{selectedMethod.chain}</span>
                  </div>

                  <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {selectedMethod.note}{" "}
                      <strong>Wrong network = permanent loss of funds.</strong>
                    </p>
                  </div>
                </div>

                {/* Proof upload card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800"
                      style={{ fontFamily: "'Sora', sans-serif" }}>
                      Upload Payment Proof
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Take a screenshot of the completed transaction and upload it below.
                    </p>
                  </div>

                  {proofFile ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={URL.createObjectURL(proofFile)}
                        alt="proof preview"
                        className="w-full max-h-52 object-cover"
                      />
                      <button
                        onClick={() => { setProofFile(null); fileRef.current.value = ""; }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md">
                        <X size={13} />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 px-3 py-2">
                        <p className="text-white text-xs truncate"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {proofFile.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="cursor-pointer flex flex-col items-center gap-2 py-9 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                      <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
                        <ImageIcon size={18} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        Click to upload screenshot
                      </p>
                      <p className="text-xs text-slate-400"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        JPG or PNG — max 5MB
                      </p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-200"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <><Upload size={15} /> Submit Deposit</>
                  )}
                </button>

                <p className="text-xs text-center text-slate-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Deposits are manually reviewed. Balance updates within 30 min of approval.
                </p>
              </div>
            )}
          </div>

          {/* ── Right: deposit history ────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-6">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Wallet size={15} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-800"
                  style={{ fontFamily: "'Sora', sans-serif" }}>
                  Deposit History
                </p>
              </div>
              <div className="px-5">
                {loadingHistory ? (
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
                ) : deposits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                      <ArrowDownToLine size={18} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      No deposits yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Your deposit history will appear here.
                    </p>
                  </div>
                ) : (
                  deposits.map(d => <DepositRow key={d._id} deposit={d} />)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}