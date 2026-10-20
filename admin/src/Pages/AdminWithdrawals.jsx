import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { PageHeader, StatusBadge, Table, ActionBtn, StatCard, fmt } from "../Components/AdminUI";
import api from "../lib/api";

const METHOD_LABELS = {
  usdt_trc20: "USDT TRC20", usdt_erc20: "USDT ERC20", usdt_bep20: "USDT BEP20",
  btc: "Bitcoin", eth: "Ethereum", sol: "Solana",
};

const MAX_REASON = 300;

// Quick-fill reasons (editable after clicking)
const REASON_PRESETS = [
  { label: "KYC incomplete",     text: "Your identity verification (KYC) is incomplete or does not match your account details. Please complete verification and submit a new request." },
  { label: "Invalid wallet",     text: "The wallet address or network provided is invalid. Please check the address and network, then submit a new request." },
  { label: "Needs review",       text: "Your account requires additional review before this withdrawal can be processed. Please contact support." },
  { label: "Over limit",         text: "The requested amount exceeds your current withdrawable limit. Please submit a smaller request." },
];

// Copies text, with a fallback for browsers/contexts where navigator.clipboard isn't available
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("pending");
  const [acting, setActing]           = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // { id }
  const [rejectReason, setRejectReason] = useState("");
  const [copiedId, setCopiedId]       = useState(null);

  useEffect(() => {
    api.get("/api/admin/withdrawals")
      .then(({ data }) => setWithdrawals(data.withdrawals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (id, address) => {
    if (!address) return;
    const ok = await copyText(address);
    if (ok) {
      setCopiedId(id);
      toast.success("Wallet address copied");
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } else {
      toast.error("Could not copy. Select the address and copy it manually.");
    }
  };

  const handleApprove = async (id) => {
    setActing(id);
    const tid = toast.loading("Approving withdrawal…");
    try {
      await api.put(`/api/withdrawals/${id}/approve`);
      toast.success("Withdrawal approved", { id: tid, description: "User balance deducted." });
      setWithdrawals(prev => prev.map(w => w._id === id ? { ...w, status: "approved" } : w));
    } catch (err) {
      toast.error("Failed", { id: tid, description: err.response?.data?.message });
    } finally {
      setActing(null);
    }
  };

  const handleReject = async () => {
    const { id } = rejectModal;
    const reason = rejectReason.trim();
    setActing(id);
    const tid = toast.loading("Rejecting withdrawal…");
    try {
      await api.put(`/api/withdrawals/${id}/reject`, { reason });
      toast.success("Withdrawal rejected", {
        id: tid,
        description: "The client will see a notice on their dashboard.",
      });
      setWithdrawals(prev => prev.map(w =>
        w._id === id
          ? { ...w, status: "rejected", rejectionReason: reason || "No reason provided." }
          : w
      ));
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      toast.error("Failed", { id: tid, description: err.response?.data?.message });
    } finally {
      setActing(null);
    }
  };

  const filtered = withdrawals.filter(w => filter === "all" ? true : w.status === filter);
  const pending  = withdrawals.filter(w => w.status === "pending").length;
  const approved = withdrawals.filter(w => w.status === "approved").length;
  const totalOut = withdrawals.filter(w => w.status === "approved").reduce((s, w) => s + w.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Withdrawal Management" subtitle="Review and process user withdrawal requests." />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending"        value={pending}                         color="amber" />
        <StatCard label="Approved"       value={approved}                        color="green" />
        <StatCard label="Total Paid Out" value={`$${totalOut.toLocaleString()}`} color="red"   />
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["pending", "approved", "rejected", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
              ${filter === f ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {f}
          </button>
        ))}
      </div>

      <Table
        headers={["User", "Amount", "Method", "Wallet Address", "Date", "Status", "Actions"]}
        loading={loading}
        emptyMsg="No withdrawal requests found.">
        {filtered.map(w => (
          <tr key={w._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
            <td className="px-4 py-3.5">
              <p className="font-semibold text-slate-800 text-sm">{w.userId?.name || "—"}</p>
              <p className="text-xs text-slate-400">{w.userId?.email}</p>
            </td>
            <td className="px-4 py-3.5 font-bold text-red-500 text-sm">-${Number(w.amount).toLocaleString()}</td>
            <td className="px-4 py-3.5 text-sm text-slate-600">{METHOD_LABELS[w.method] || w.method}</td>
            <td className="px-4 py-3.5">
              <div className="flex items-start gap-2 max-w-[260px]">
                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded break-all select-all">
                  {w.walletAddress || "—"}
                </span>
                {w.walletAddress && (
                  <button
                    type="button"
                    onClick={() => handleCopy(w._id, w.walletAddress)}
                    className="flex-shrink-0 p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                    title="Copy address"
                    aria-label="Copy wallet address"
                  >
                    {copiedId === w._id
                      ? <Check className="w-3.5 h-3.5 text-green-600" />
                      : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-400">{fmt(w.createdAt)}</td>
            <td className="px-4 py-3.5">
              <StatusBadge status={w.status} />
              {w.status === "rejected" && w.rejectionReason && (
                <p
                  className="text-[11px] text-slate-400 mt-1 max-w-[180px] truncate"
                  title={w.rejectionReason}
                >
                  {w.rejectionReason}
                </p>
              )}
            </td>
            <td className="px-4 py-3.5">
              {w.status === "pending" ? (
                <div className="flex gap-1.5">
                  <ActionBtn label="Approve" color="green" onClick={() => handleApprove(w._id)} disabled={acting === w._id} />
                  <ActionBtn label="Reject"  color="red"   onClick={() => { setRejectModal({ id: w._id }); setRejectReason(""); }} disabled={acting === w._id} />
                </div>
              ) : <span className="text-xs text-slate-400">—</span>}
            </td>
          </tr>
        ))}
      </Table>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div>
              <p className="font-bold text-slate-800">Reject Withdrawal</p>
              <p className="text-xs text-slate-500 mt-1">
                The client sees this message in a popup on their dashboard. Leave it empty to
                reject without a reason.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {REASON_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setRejectReason(p.text)}
                  className="px-2.5 py-1 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value.slice(0, MAX_REASON))}
                rows={4}
                placeholder="Reason for rejection (optional)…"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50"
              />
              <p className="text-[11px] text-slate-400 text-right mt-1">
                {rejectReason.length}/{MAX_REASON}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <ActionBtn label="Cancel" color="slate" onClick={() => setRejectModal(null)} />
              <ActionBtn label="Confirm Reject" color="red" onClick={handleReject} disabled={!!acting} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}