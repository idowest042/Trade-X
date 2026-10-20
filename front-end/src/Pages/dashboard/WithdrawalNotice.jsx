import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, ShieldCheck, ArrowUpFromLine, X } from "lucide-react";
import useAuthStore from "../../stores/useauthstore";
import api from "../../lib/api";
import { getSocket } from "../../stores/socket";

// Only surface rejections from the last N days (old ones shouldn't pop up out of nowhere)
const RECENT_DAYS = 14;
const NO_REASON = "No reason provided.";

const METHOD_LABELS = {
  usdt_trc20: "USDT (TRC20)", usdt_erc20: "USDT (ERC20)", usdt_bep20: "USDT (BEP20)",
  btc: "Bitcoin", eth: "Ethereum", sol: "Solana",
};

const money = (n) =>
  Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Dismissed popups are remembered per user, per device
const storageKey = (uid) => `tradex:dismissed-withdrawals:${uid}`;
const readDismissed = (uid) => {
  try { return JSON.parse(localStorage.getItem(storageKey(uid))) || []; } catch { return []; }
};
const saveDismissed = (uid, ids) => {
  try { localStorage.setItem(storageKey(uid), JSON.stringify(ids.slice(-100))); } catch { /* ignore */ }
};

const maskAddress = (a = "") => (a.length > 16 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a);

export default function WithdrawalNotice() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const uid = user?._id || user?.id;

  const [queue, setQueue]         = useState([]);        // rejected, not yet dismissed
  const [kycStatus, setKycStatus] = useState(undefined); // undefined = not loaded yet

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const { data } = await api.get("/api/withdrawals/my");
      const dismissed = readDismissed(uid);
      const cutoff = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;

      const unseen = (data.withdrawals || [])
        .filter((w) =>
          w.status === "rejected" &&
          !dismissed.includes(w._id) &&
          new Date(w.reviewedAt || w.createdAt).getTime() >= cutoff
        )
        .sort((a, b) => new Date(b.reviewedAt || b.createdAt) - new Date(a.reviewedAt || a.createdAt));

      setQueue(unseen);
    } catch {
      // silent: the popup is an enhancement, never block the dashboard
    }
  }, [uid]);

  // Check on mount (covers "client logs in later")
  useEffect(() => { load(); }, [load]);

  // Live: admin rejects while the client is online
  useEffect(() => {
    if (!token) return;
    const sock = getSocket(token);
    const onUpdate = () => load();
    sock.on("withdrawal:update", onUpdate);
    return () => sock.off("withdrawal:update", onUpdate);
  }, [token, load]);

  const current = queue[0];

  // Decide which next step to recommend
  useEffect(() => {
    if (!current || kycStatus !== undefined) return;
    api.get("/api/kyc/me")
      .then(({ data }) => setKycStatus(data.kyc?.status || null))
      .catch(() => setKycStatus(null));
  }, [current, kycStatus]);

  const dismiss = useCallback(() => {
    if (!current) return;
    saveDismissed(uid, [...readDismissed(uid), current._id]);
    setQueue((q) => q.slice(1));
  }, [current, uid]);

  // Escape closes; page behind doesn't scroll while the popup is open
  useEffect(() => {
    if (!current) return;
    const onKey = (e) => { if (e.key === "Escape") dismiss(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [current, dismiss]);

  if (!current) return null;

  const reason =
    current.rejectionReason && current.rejectionReason !== NO_REASON
      ? current.rejectionReason
      : null;

  const needsKyc = kycStatus !== undefined && kycStatus !== "approved";
  const reviewedOn = new Date(current.reviewedAt || current.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  const primaryAction = () => {
    dismiss();
    navigate(needsKyc ? "/dashboard/kyc" : "/dashboard/withdraw");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wd-notice-title"
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-rose-500" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0">
            <XCircle size={20} className="text-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="wd-notice-title" className="text-base font-semibold text-slate-900">
              Withdrawal request declined
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Your request for{" "}
              <span className="font-medium text-slate-700 tabular-nums">
                ${money(current.amount)}
              </span>{" "}
              could not be processed.
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-slate-400 hover:text-slate-700 p-1 -m-1 flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-5 space-y-4">
          {/* Reason */}
          <div className="border-l-2 border-rose-300 bg-rose-50/60 rounded-r-md px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700 mb-1">
              Reason from our review team
            </p>
            <p className="text-sm text-slate-700 leading-relaxed break-words">
              {reason || "No specific reason was recorded for this decision. If you need clarification, please contact support."}
            </p>
          </div>

          {/* Request details */}
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
            {[
              ["Method",    METHOD_LABELS[current.method] || current.method],
              ["Wallet",    maskAddress(current.walletAddress)],
              ["Reviewed",  reviewedOn],
              ["Reference", `#${String(current._id).slice(-8).toUpperCase()}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-4 py-2.5 text-xs">
                <span className="text-slate-500">{k}</span>
                <span className={`font-medium text-slate-800 ${k === "Wallet" || k === "Reference" ? "font-mono" : ""}`}>
                  {v}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            No funds were deducted from your balance. You can resolve the issue above and
            submit a new request at any time.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            onClick={dismiss}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white rounded-lg transition-colors"
          >
            {queue.length > 1 ? `Dismiss (${queue.length - 1} more)` : "I understand"}
          </button>
          <button
            onClick={primaryAction}
            className="px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            {needsKyc ? <ShieldCheck size={15} /> : <ArrowUpFromLine size={15} />}
            {needsKyc ? "Complete verification" : "New withdrawal request"}
          </button>
        </div>
      </div>
    </div>
  );
}