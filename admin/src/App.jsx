import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout         from "./layout/AdminLayout";
import AdminLogin          from "./pages/AdminLogin";
import AdminDashboard      from "./pages/AdminDashboard";
import AdminKYC            from "./pages/AdminKYC";
import AdminDeposits       from "./pages/AdminDeposits";
import AdminWithdrawals    from "./pages/AdminWithdrawals";
import AdminUsers          from "./pages/AdminUsers";
import AdminTrades         from "./pages/AdminTrades";
import Home from "./Pages/Home";

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
          <Route path="home"      element={<Home />} />
        </Route>

        {/* ── / and everything else → /login ───────────────────────────── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;