import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ShieldCheck,
  ArrowDownToLine, ArrowUpFromLine, LogOut, Zap, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import useAdminStore from "../store/useAdminStore";

const NAV = [
  { to: "/admin",             label: "Dashboard",   icon: LayoutDashboard, end: true },
  { to: "/admin/users",       label: "Users",       icon: Users           },
  { to: "/admin/kyc",         label: "KYC",         icon: ShieldCheck     },
  { to: "/admin/deposits",    label: "Deposits",    icon: ArrowDownToLine },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { to: "/admin/trades",      label: "Trades",      icon: TrendingUp      },
];

export default function AdminSidebar() {
  const { admin, logout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <aside className="w-56 h-screen bg-slate-900 flex flex-col flex-shrink-0 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-slate-700/60">
        <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
          <Zap size={13} className="text-white" fill="white" />
        </div>
        <div>
          <span className="text-white font-bold text-sm tracking-wide">TradeX</span>
          <span className="ml-1.5 text-[10px] font-semibold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
               ${isActive
                 ? "bg-blue-600 text-white"
                 : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
            }>
            <Icon size={16} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Admin info + logout */}
      <div className="px-3 pb-4 border-t border-slate-700/60 pt-3 space-y-2">
        <div className="px-3 py-2 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-semibold text-white truncate">{admin?.name || "Admin"}</p>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}