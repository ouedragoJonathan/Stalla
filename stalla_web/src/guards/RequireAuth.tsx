import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
