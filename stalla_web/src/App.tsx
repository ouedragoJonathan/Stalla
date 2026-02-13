import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireAdmin } from "./guards/RequireAdmin";
import { AdminLayout } from "./components/AdminLayout";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { DashboardPage } from "./features/admin/pages/DashboardPage";
import { StallsPage } from "./features/admin/pages/StallsPage";
import { VendorsPage } from "./features/admin/pages/VendorsPage";
import { AllocationsPage } from "./features/admin/pages/AllocationsPage";
import { PaymentsPage } from "./features/admin/pages/PaymentsPage";
import { DebtorsPage } from "./features/admin/pages/DebtorsPage";
import { SupportSettingsPage } from "./features/admin/pages/SupportSettingsPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="stalls" element={<StallsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="allocations" element={<AllocationsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="debtors" element={<DebtorsPage />} />
            <Route path="support" element={<SupportSettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
