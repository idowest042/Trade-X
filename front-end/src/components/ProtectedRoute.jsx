import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useauthstore";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the intended destination so we can redirect after login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}