import { useState, useEffect } from "react";
import { Send, ArrowDownLeft, ArrowUpRight, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../../stores/useauthstore";
import api from "../../lib/api";

function TransferRow({ t, userId }) {
  const isSent     = t.senderId?._id === userId || t.senderId === userId;
  const counterpart = isSent ? t.receiverId : t.senderId;
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isSent ? "bg-red-100" : "bg-green-100"}`}>
          {isSent ? <ArrowUpRight size={15} className="text-red-500" /> : <ArrowDownLeft size={15} className="text-green-600" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {isSent ? `To: ${counterpart?.name || "—"}` : `From: ${counterpart?.name || "—"}`}
          </p>
          <p className="text-xs text-slate-400 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {counterpart?.email} · {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          {t.note && <p className="text-xs text-slate-400 italic truncate">{t.note}</p>}
        </div>
      </div>
      <p className={`text-sm font-bold flex-shrink-0 ${isSent ? "text-red-500" : "text-green-600"}`}
        style={{ fontFamily: "'Sora', sans-serif" }}>
        {isSent ? "-" : "+"}${Number(t.amount).toLocaleString()}
      </p>
    </div>
  );
}

export default function TransferPage() {
  const { user } = useAuthStore();
  const [form, setForm]         = useState({ recipientEmail: "", amount: "", note: "" });
  const [balance, setBalance]   = useState(user?.balance || 0);
  const [history, setHistory]   = useState([]);
  const [submitting, setSubmit] = useState(false);
  const [histLoad, setHistLoad] = useState(true);

  const parsed   = parseFloat(form.amount) || 0;
  const canSend  = form.recipientEmail.trim().length > 4 && parsed > 0 && parsed <= balance && !submitting;
  const amtError = form.amount && (parsed <= 0 ? "Enter a valid amount." : parsed > balance ? "Insufficient balance." : null);

  useEffect(() => {
    Promise.all([api.get("/api/transfer/my"), api.get("/api/auth/me")])
      .then(([hRes, mRes]) => {
        setHistory(hRes.data.transfers || []);
        setBalance(mRes.data.user?.balance || 0);
      }).catch(() => {})
      .finally(() => setHistLoad(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSend) return;
    setSubmit(true);
    const tid = toast.loading("Sending transfer…");
    try {
      const { data } = await api.post("/api/transfer", {
        recipientEmail: form.recipientEmail.trim().toLowerCase(),
        amount:         parsed,
        note:           form.note.trim(),
      });
      toast.success("Transfer sent!", { id: tid, description: data.message });
      setHistory(prev => [data.transfer, ...prev]);
      setBalance(prev => prev - parsed);
      setForm({ recipientEmail: "", amount: "", note: "" });
    } catch (err) {
      toast.error("Transfer failed", { id: tid, description: err.response?.data?.message || "Please try again." });
    } finally {
      setSubmit(false);
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Send Funds</h1>
          <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Transfer USD balance to another TradeX user instantly. No fees.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Form */}
          <div className="lg:col-span-3 space-y-4">

            {/* Balance card */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-center justify-between">
              <p className="text-sm text-blue-600 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your USD Balance</p>
              <p className="text-xl font-bold text-blue-700" style={{ fontFamily: "'Sora', sans-serif" }}>
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Transfer Details</p>

              {/* Recipient */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Recipient Email <span className="text-red-400">*</span>
                </label>
                <input type="email" value={form.recipientEmail}
                  onChange={e => setForm(p => ({ ...p, recipientEmail: e.target.value }))}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                <p className="flex items-center gap-1.5 text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <Info size={11} />
                  The recipient must have a registered TradeX account.
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Amount (USD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <input type="number" min="1" value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border text-slate-900 text-sm bg-slate-50
                      focus:outline-none focus:ring-2 focus:bg-white transition-all
                      ${amtError ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500 focus:border-transparent"}`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
                {amtError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    <AlertCircle size={11} />{amtError}
                  </p>
                )}
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>Note (optional)</label>
                <input type="text" value={form.note} maxLength={100}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="What's this for?"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {/* Summary */}
              {canSend && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-1.5">
                  {[
                    ["Sending",   `$${parsed.toLocaleString()}`],
                    ["Fee",       "None"],
                    ["Recipient", form.recipientEmail],
                  ].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      <span className="text-blue-500">{k}</span>
                      <span className="font-semibold text-blue-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" disabled={!canSend}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-200 disabled:shadow-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {submitting ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                ) : <Send size={15} />}
                {submitting ? "Sending…" : "Send Transfer"}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-6">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Send size={15} className="text-blue-600" />
                <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Transfer History</p>
              </div>
              <div className="px-5">
                {histLoad ? (
                  <div className="py-6 space-y-3 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-10 text-center">
                    <Send size={22} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>No transfers yet</p>
                  </div>
                ) : history.map(t => (
                  <TransferRow key={t._id} t={t} userId={user?._id} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}