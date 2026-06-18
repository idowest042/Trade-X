import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatCard, Table, ActionBtn, StatusBadge, fmt } from "../Components/AdminUI";
import { Search } from "lucide-react";
import api from "../lib/api";

function BalanceModal({ user, onClose, onUpdate }) {
  const [amount,  setAmount]  = useState("");
  const [type,    setType]    = useState("add"); // add | deduct | set
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) { toast.error("Enter a valid amount."); return; }
    setLoading(true);
    const tid = toast.loading("Updating balance…");
    try {
      const { data } = await api.put(`/api/admin/users/${user._id}/balance`, { amount: val, type });
      toast.success("Balance updated", { id: tid, description: `New balance: $${data.user.balance.toLocaleString()}` });
      onUpdate(user._id, data.user.balance);
      onClose();
    } catch (err) {
      toast.error("Failed", { id: tid, description: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div>
          <p className="font-bold text-slate-800">Adjust Balance</p>
          <p className="text-sm text-slate-500 mt-0.5">{user.name} — Current: <span className="font-bold text-blue-600">${user.balance?.toLocaleString()}</span></p>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {[["add", "Add"], ["deduct", "Deduct"], ["set", "Set To"]].map(([v, l]) => (
            <button key={v} onClick={() => setType(v)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${type === v ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
          <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full pl-7 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-2 justify-end">
          <ActionBtn label="Cancel"  color="slate" onClick={onClose} />
          <ActionBtn label="Confirm" color="blue"  onClick={handleSubmit} disabled={loading} />
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/api/admin/users")
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBalanceUpdate = (userId, newBalance) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, balance: newBalance } : u));
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const verified = users.filter(u => u.isKycVerified).length;
  const totalBal = users.reduce((s, u) => s + (u.balance || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader title="User Management" subtitle="View all registered users and manage their accounts." />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Users"    value={users.length}                      color="blue"  />
        <StatCard label="KYC Verified"   value={verified}                           color="green" />
        <StatCard label="Total Balances" value={`$${totalBal.toLocaleString()}`}   color="slate" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <Table
        headers={["User", "Balance", "KYC", "Role", "Joined", "Actions"]}
        loading={loading}
        emptyMsg="No users found.">
        {filtered.map(u => (
          <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
            <td className="px-4 py-3.5">
              <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </td>
            <td className="px-4 py-3.5 font-bold text-blue-600 text-sm">
              ${(u.balance || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </td>
            <td className="px-4 py-3.5">
              {u.isKycVerified
                ? <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">Verified</span>
                : <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Unverified</span>
              }
            </td>
            <td className="px-4 py-3.5">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize
                ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"}`}>
                {u.role}
              </span>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-400">{fmt(u.createdAt)}</td>
            <td className="px-4 py-3.5">
              <ActionBtn label="Adjust Balance" color="blue" onClick={() => setSelected(u)} />
            </td>
          </tr>
        ))}
      </Table>

      {selected && <BalanceModal user={selected} onClose={() => setSelected(null)} onUpdate={handleBalanceUpdate} />}
    </div>
  );
}