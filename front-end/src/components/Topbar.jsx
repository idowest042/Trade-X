import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import useAuthStore from "../stores/useauthstore";

const API_URL = "https://trade-x-4lcn.onrender.com" || "http://localhost:5000";

export default function Topbar({ onMobileMenuClick }) {
  const navigate = useNavigate();
  const { user, token, logout, login } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [balance, setBalance] = useState(user?.balance ?? 0);
  const dropdownRef = useRef(null);

  // Keep balance in sync with Zustand user
  useEffect(() => {
    setBalance(user?.balance ?? 0);
  }, [user?.balance]);

  // Real-time balance updates via Socket.IO
  useEffect(() => {
    if (!token) return;
    const sock = io(API_URL, { auth: { token }, transports: ["websocket"] });

    sock.on("balance:update", (newBalance) => {
      setBalance(newBalance);
      if (user) login({ ...user, balance: newBalance }, token);
    });

    return () => sock.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Close dropdown on outside click
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
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-10">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Welcome back,
          </p>
          <p className="text-sm font-semibold text-slate-800 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            {user?.name || "Trader"}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Live balance pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5">
          <span className="text-xs text-blue-500 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>Balance</span>
          <span className="text-sm font-bold text-blue-700" style={{ fontFamily: "'Sora', sans-serif" }}>
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold" style={{ fontFamily: "'Sora', sans-serif" }}>
                {initials}
              </span>
            </div>
            <span
              className="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {user?.name || "User"}
            </span>
            <ChevronDown
              size={14}
              className={`hidden sm:block text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/60 py-1.5 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {user?.email}
                </p>
                {/* Mobile balance */}
                <p className="text-xs font-bold text-blue-600 mt-1.5 sm:hidden" style={{ fontFamily: "'Sora', sans-serif" }}>
                  ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="py-1">
                <DropItem
                  icon={User}
                  label="My Profile"
                  onClick={() => { navigate("/dashboard/settings"); setDropdownOpen(false); }}
                />
                <DropItem
                  icon={Settings}
                  label="Settings"
                  onClick={() => { navigate("/dashboard/settings"); setDropdownOpen(false); }}
                />
              </div>

              <div className="border-t border-slate-100 pt-1 pb-1">
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
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Icon size={15} className="flex-shrink-0" />
      {label}
    </button>
  );
}