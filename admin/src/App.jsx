import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AdminProtectedRoute from "./Components/AdminProtectedRoute";
import AdminLayout         from "./layout/AdminLayout";
import AdminLogin          from "./Pages/AdminLogin";
import AdminDashboard      from "./Pages/AdminDashboard";
import AdminKYC            from "./Pages/AdminKYC";
import AdminDeposits       from "./Pages/AdminDeposits";
import AdminWithdrawals    from "./Pages/AdminWithdrawals";
import AdminUsers          from "./Pages/AdminUsers";
import AdminTrades         from "./Pages/AdminTrades";
import AdminMessages from "./Pages/Home";

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{ style: { fontFamily: "'IBM Plex Sans', sans-serif" } }}
      />

      <Routes>
        {/* ── Only public route ────────────────────────────────────────── */}
        <Route path="/login" element={<AdminLogin />} />

        {/* ── Protected dashboard ──────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index              element={<AdminDashboard />} />
          <Route path="users"       element={<AdminUsers />} />
          <Route path="kyc"         element={<AdminKYC />} />
          <Route path="deposits"    element={<AdminDeposits />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="trades"      element={<AdminTrades />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>

        {/* ── / and everything else → /login ───────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;