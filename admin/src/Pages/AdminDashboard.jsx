import { useEffect, useState } from "react";
import { Users, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react";
import { StatCard, PageHeader, fmt } from "../components/AdminUI";
import api from "../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, kyc, deposits, withdrawals] = await Promise.all([
          api.get("/api/admin/users"),
          api.get("/api/admin/kyc"),
          api.get("/api/admin/deposits"),
          api.get("/api/admin/withdrawals"),
        ]);
        setStats({
          totalUsers:      users.data.users?.length          || 0,
          pendingKyc:      kyc.data.submissions?.filter(k => k.status === "pending").length  || 0,
          pendingDeposits: deposits.data.deposits?.filter(d => d.status === "pending").length || 0,
          pendingWithdraw: withdrawals.data.withdrawals?.filter(w => w.status === "pending").length || 0,
          recentDeposits:  deposits.data.deposits?.slice(0, 5) || [],
          recentKyc:       kyc.data.submissions?.slice(0, 5) || [],
        });
      } catch {
        setStats({ totalUsers: 0, pendingKyc: 0, pendingDeposits: 0, pendingWithdraw: 0, recentDeposits: [], recentKyc: [] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-48 bg-slate-200 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of all platform activity." />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"      value={stats.totalUsers}      color="blue"  />
        <StatCard label="Pending KYC"      value={stats.pendingKyc}      color="amber" />
        <StatCard label="Pending Deposits" value={stats.pendingDeposits} color="green" />
        <StatCard label="Pending Withdrawals" value={stats.pendingWithdraw} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deposits */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <ArrowDownToLine size={15} className="text-blue-600" />
            <p className="text-sm font-semibold text-slate-800">Recent Deposits</p>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentDeposits.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No deposits yet.</p>
            ) : stats.recentDeposits.map(d => (
              <div key={d._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{d.userId?.name || "User"}</p>
                  <p className="text-xs text-slate-400">{d.method?.toUpperCase()} · {fmt(d.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">${Number(d.amount).toLocaleString()}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${d.status === "pending" ? "bg-amber-100 text-amber-700" : d.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {d.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent KYC */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-600" />
            <p className="text-sm font-semibold text-slate-800">Recent KYC Submissions</p>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentKyc.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No submissions yet.</p>
            ) : stats.recentKyc.map(k => (
              <div key={k._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{k.firstName} {k.lastName}</p>
                  <p className="text-xs text-slate-400">{k.documentType?.replace("_", " ")} · {fmt(k.createdAt)}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                  ${k.status === "pending" ? "bg-amber-100 text-amber-700" : k.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {k.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}