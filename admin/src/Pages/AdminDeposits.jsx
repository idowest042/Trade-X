import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { PageHeader, StatusBadge, Table, ActionBtn, StatCard, fmt } from "../Components/AdminUI";
import api from "../lib/api";

const METHOD_LABELS = {
  usdt_trc20: "USDT TRC20", usdt_erc20: "USDT ERC20", usdt_bep20: "USDT BEP20",
  btc: "Bitcoin", eth: "Ethereum", sol: "Solana",
};

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("pending");
  const [acting, setActing]     = useState(null); // id of row being acted on

  useEffect(() => {
    api.get("/api/admin/deposits")
      .then(({ data }) => setDeposits(data.deposits || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handle = async (id, action) => {
    setActing(id);
    const tid = toast.loading(`${action === "approve" ? "Approving" : "Rejecting"} deposit…`);
    try {
      await api.put(`/api/deposits/${id}/${action}`);
      toast.success(`Deposit ${action}d`, { id: tid, description: action === "approve" ? "User balance credited." : "Deposit rejected." });
      setDeposits(prev => prev.map(d => d._id === id ? { ...d, status: action === "approve" ? "approved" : "rejected" } : d));
    } catch (err) {
      toast.error("Action failed", { id: tid, description: err.response?.data?.message });
    } finally {
      setActing(null);
    }
  };

  const filtered  = deposits.filter(d => filter === "all" ? true : d.status === filter);
  const pending   = deposits.filter(d => d.status === "pending").length;
  const approved  = deposits.filter(d => d.status === "approved").length;
  const totalVol  = deposits.filter(d => d.status === "approved").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Deposit Management" subtitle="Review and approve user deposit requests." />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending"        value={pending}                              color="amber" />
        <StatCard label="Approved"       value={approved}                             color="green" />
        <StatCard label="Total Approved" value={`$${totalVol.toLocaleString()}`}      color="blue"  />
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
        headers={["User", "Amount", "Method", "Proof", "Date", "Status", "Actions"]}
        loading={loading}
        emptyMsg="No deposits found.">
        {filtered.map(d => (
          <tr key={d._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
            <td className="px-4 py-3.5">
              <p className="font-semibold text-slate-800 text-sm">{d.userId?.name || "—"}</p>
              <p className="text-xs text-slate-400">{d.userId?.email}</p>
            </td>
            <td className="px-4 py-3.5 font-bold text-green-600 text-sm">${Number(d.amount).toLocaleString()}</td>
            <td className="px-4 py-3.5 text-sm text-slate-600">{METHOD_LABELS[d.method] || d.method}</td>
            <td className="px-4 py-3.5">
              <a href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${d.proofImage}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <ExternalLink size={11} /> View
              </a>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-400">{fmt(d.createdAt)}</td>
            <td className="px-4 py-3.5"><StatusBadge status={d.status} /></td>
            <td className="px-4 py-3.5">
              {d.status === "pending" ? (
                <div className="flex gap-1.5">
                  <ActionBtn label="Approve" color="green" onClick={() => handle(d._id, "approve")} disabled={acting === d._id} />
                  <ActionBtn label="Reject"  color="red"   onClick={() => handle(d._id, "reject")}  disabled={acting === d._id} />
                </div>
              ) : <span className="text-xs text-slate-400">—</span>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}