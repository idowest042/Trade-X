import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { toast } from "sonner";
import { getSocket } from "../stores/socket";
import useAuthStore from "../stores/useauthstore";

const money = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Topbar({ onMobileMenuClick }) {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState(user?.balance ?? 0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setBalance(user?.balance ?? 0);
  }, [user?.balance]);

  useEffect(() => {
    if (!token) return;
    const sock = getSocket(token);

    const onBalance = (newBalance) => setBalance(newBalance);
    sock.on("balance:update", onBalance);

    return () => sock.off("balance:update", onBalance);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", { description: "See you next time!" });
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10 font-sans">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs text-slate-400 leading-none">Welcome back</p>
          <p className="text-sm font-semibold text-slate-900 leading-tight mt-0.5">
            {user?.name || "Trader"}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Live balance — plain bordered figure, not a colored pill */}
        <div className="hidden sm:flex items-center gap-2 border border-slate-200 rounded-lg px-3.5 py-1.5">
          <span className="text-xs text-slate-400 font-medium">Balance</span>
          <span className="text-sm font-semibold text-slate-900 tabular-nums">
            ${money(balance)}
          </span>
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-slate-900" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{initials}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
              {user?.name || "User"}
            </span>
            <ChevronDown
              size={14}
              className={`hidden sm:block text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                <p className="text-xs font-semibold text-slate-700 mt-1.5 sm:hidden tabular-nums">
                  ${money(balance)}
                </p>
              </div>

              <div className="py-1">
                <DropItem
                  icon={User}
                  label="My profile"
                  onClick={() => { navigate("/dashboard/settings"); setDropdownOpen(false); }}
                />
                <DropItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => { navigate("/dashboard/settings"); setDropdownOpen(false); }}
                />
              </div>

              <div className="border-t border-slate-100 pt-1">
                <DropItem icon={LogOut} label="Log out" onClick={handleLogout} danger />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function DropItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={15} className="flex-shrink-0" />
      {label}
    </button>
  );
}