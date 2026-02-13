import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

export function RequireAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}
