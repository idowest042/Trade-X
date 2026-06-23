import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, ShieldCheck,
  ArrowDownToLine, ArrowUpFromLine, LogOut, Zap, TrendingUp, MessageCircle,
  Menu, X
} from "lucide-react";
import { toast } from "sonner";
import useAdminStore from "../Store/useAdminStore";

const NAV = [
  { to: "/admin",             label: "Dashboard",   icon: LayoutDashboard, end: true },
  { to: "/admin/users",       label: "Users",       icon: Users           },
  { to: "/admin/kyc",         label: "KYC",         icon: ShieldCheck     },
  { to: "/admin/deposits",    label: "Deposits",    icon: ArrowDownToLine },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { to: "/admin/trades",      label: "Trades",      icon: TrendingUp      },
   { to: "/admin/messages",    label: "Messages",    icon: MessageCircle   },
];

export default function AdminSidebar() {
  const { admin, logout } = useAdminStore();
  const navigate = useNavigate();

  // Desktop: controls icon-only vs full-width sidebar.
  // Mobile: controls whether the drawer is open at all (overlay).
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile-only floating toggle, visible when the drawer is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
          className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile backdrop, closes the drawer on tap */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          bg-slate-900 flex flex-col flex-shrink-0 h-screen sticky top-0 transition-all duration-200 z-50
          ${isOpen ? "w-56" : "w-0 lg:w-16"}
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          fixed lg:sticky inset-y-0 left-0 overflow-hidden
        `}
      >
        {/* Logo + collapse/close toggle */}
        <div className="flex items-center justify-between gap-2.5 px-3 h-14 border-b border-slate-700/60 flex-shrink-0">
          <div className={`flex items-center gap-2.5 overflow-hidden ${!isOpen && "lg:justify-center lg:w-full"}`}>
            <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center flex-shrink-0">
              <Zap size={13} className="text-white" fill="white" />
            </div>
            {isOpen && (
              <div className="whitespace-nowrap">
                <span className="text-white font-bold text-sm tracking-wide">TradeX</span>
                <span className="ml-1.5 text-[10px] font-semibold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Admin</span>
              </div>
            )}
          </div>

          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Desktop-only collapsed-state expand button, sits below the header */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Expand sidebar"
            className="hidden lg:flex items-center justify-center py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors flex-shrink-0"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              title={!isOpen ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                 ${!isOpen && "lg:justify-center lg:px-0"}
                 ${isActive
                   ? "bg-blue-600 text-white"
                   : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
              }>
              <Icon size={16} className="flex-shrink-0" />
              {isOpen && label}
            </NavLink>
          ))}
        </nav>

        {/* Admin info + logout */}
        <div className="px-3 pb-4 border-t border-slate-700/60 pt-3 space-y-2 flex-shrink-0">
          {isOpen ? (
            <>
              <div className="px-3 py-2 bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-400">Logged in as</p>
                <p className="text-sm font-semibold text-white truncate">{admin?.name || "Admin"}</p>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
                <LogOut size={16} />
                Log out
              </button>
            </>
          ) : (
            <button onClick={handleLogout}
              title="Log out"
              className="hidden lg:flex w-full items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}