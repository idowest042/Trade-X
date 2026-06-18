import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Briefcase,
  FileText,
  ArrowLeftRight,
  Send,
  Settings,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Gift,
} from "lucide-react";

const navGroups = [
  {
    label: "Main Menu",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/dashboard/kyc",      label: "KYC Verification", icon: ShieldCheck },
      { to: "/dashboard/deposit",  label: "Deposit",          icon: ArrowDownToLine },
      { to: "/dashboard/withdraw", label: "Withdraw",         icon: ArrowUpFromLine },
    ],
  },
  {
    label: "Trading",
    items: [
      { to: "/dashboard/trade",        label: "Live Trading",     icon: TrendingUp     },
      { to: "/dashboard/plans",        label: "Investment Plans", icon: TrendingUp },
      { to: "/dashboard/investments",  label: "My Investments",   icon: Briefcase },
      { to: "/dashboard/transactions", label: "Transactions",     icon: FileText },
      { to: "/dashboard/swap",         label: "Crypto Swap",      icon: ArrowLeftRight },
      { to: "/dashboard/transfer",     label: "Transfer",         icon: Send           },
    ],
  },
  {
    label: "Preferences",
    items: [
      { to: "/dashboard/referral", label: "Referral",  icon: Gift     },
      { to: "/dashboard/settings", label: "Settings",  icon: Settings },
    ],
  },
];

export default function Sidebar({ collapsed, onToggleCollapse, isMobile, onMobileClose }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 flex-shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={14} className="text-white" fill="white" />
          </div>
          {!collapsed && (
            <span
              className="text-lg font-bold text-slate-900 whitespace-nowrap"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              TradeX
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Desktop: collapse/expand toggle */}
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}

          {/* Mobile: X close button */}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-2">
            {/* Group heading — hide when collapsed on desktop */}
            {!collapsed && (
              <p
                className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {group.label}
              </p>
            )}
            {collapsed && <div className="pt-3" />}

            {group.items.map((item) => (
              <NavItem
                key={item.to}
                item={item}
                collapsed={collapsed}
                onClose={onMobileClose}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── Help card ───────────────────────────────────────────────── */}
      {!collapsed ? (
        <div className="px-2 pb-4 flex-shrink-0">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Headphones size={13} className="text-blue-500" />
              <p className="text-xs font-semibold text-blue-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Need help?
              </p>
            </div>
            <p className="text-xs text-blue-500 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Contact our support team anytime.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex justify-center pb-4">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
            <Headphones size={16} className="text-blue-500" />
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ item, collapsed, onClose }) {
  const { to, label, icon: Icon, end } = item;

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
         transition-all duration-150 group mb-0.5
         ${collapsed ? "lg:justify-center lg:px-2" : ""}
         ${isActive
           ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
           : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
         }`
      }
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={17}
            className={`flex-shrink-0 ${
              isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
            }`}
          />

          {/* Label — hidden when collapsed on desktop */}
          <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
            {label}
          </span>

          {/* Hover tooltip when collapsed */}
          {collapsed && (
            <span
              className="
                hidden lg:block absolute left-full ml-3 px-2.5 py-1.5
                bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-opacity duration-150 shadow-lg z-50
              "
            >
              {label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}