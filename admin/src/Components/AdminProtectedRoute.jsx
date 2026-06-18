import { Navigate, useLocation } from "react-router-dom";
import useAdminStore from "../Store/useAdminStore";

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, admin } = useAdminStore();
  const location = useLocation();

  if (!isAuthenticated || admin?.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}