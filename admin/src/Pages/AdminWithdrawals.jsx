import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatusBadge, Table, ActionBtn, StatCard, fmt } from "../Components/AdminUI";
import api from "../lib/api";

const METHOD_LABELS = {
  usdt_trc20: "USDT TRC20", usdt_erc20: "USDT ERC20", usdt_bep20: "USDT BEP20",
  btc: "Bitcoin", eth: "Ethereum", sol: "Solana",
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("pending");
  const [acting, setActing]           = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // { id }
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    api.get("/api/admin/withdrawals")
      .then(({ data }) => setWithdrawals(data.withdrawals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    setActing(id);
    const tid = toast.loading("Rejecting withdrawal…");
    try {
      await api.put(`/api/withdrawals/${id}/reject`, { reason: rejectReason });
      toast.success("Withdrawal rejected", { id: tid });
      setWithdrawals(prev => prev.map(w => w._id === id ? { ...w, status: "rejected" } : w));
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
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {w.walletAddress?.slice(0, 16)}…
              </span>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-400">{fmt(w.createdAt)}</td>
            <td className="px-4 py-3.5"><StatusBadge status={w.status} /></td>
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
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <p className="font-bold text-slate-800">Reject Withdrawal</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              placeholder="Reason for rejection (optional)…"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50" />
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