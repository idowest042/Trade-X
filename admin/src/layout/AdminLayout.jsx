import { Outlet } from "react-router-dom";
import AdminSidebar from "../Components/AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 flex-shrink-0">
          <p className="text-sm text-slate-500 font-medium">TradeX Administration Panel</p>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}