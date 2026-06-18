import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false); // desktop icon-only mode
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      {/*
        Root shell: flex row on desktop, stacked on mobile.
        Sidebar sits in normal flow on desktop (not fixed) so it
        never overlaps the main content area.
        On mobile the sidebar becomes a fixed overlay drawer.
      */}
      <div className="flex h-screen bg-slate-50 overflow-hidden">

        {/* ── Sidebar — desktop only, sits in normal flex flow ───────── */}
        <div
          className={`
            hidden lg:flex flex-col flex-shrink-0
            bg-white border-r border-slate-100
            transition-all duration-300
            ${collapsed ? "w-[72px]" : "w-64"}
          `}
        >
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(v => !v)}
            isMobile={false}
            onMobileClose={() => {}}
          />
        </div>

        {/* ── Main content ───────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar onMobileMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>

      </div>

      {/* ── Mobile drawer — rendered outside flex row, true overlay ─── */}
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden
          transition-opacity duration-300
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setMobileOpen(false)}
      />
      {/* Drawer */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 z-50 lg:hidden
          bg-white border-r border-slate-100
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar
          collapsed={false}
          onToggleCollapse={() => {}}
          isMobile={true}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>
    </>
  );
}