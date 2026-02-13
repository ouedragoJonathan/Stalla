import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "../guards/RequireAuth";
import { RequireAdmin } from "../guards/RequireAdmin";
import { AdminLayout } from "../components/AdminLayout";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterAdminPage } from "../features/auth/RegisterAdminPage";
import { DashboardPage } from "../features/admin/pages/DashboardPage";
import { StandsPage } from "../features/admin/pages/StandsPage";
import { VendorsPage } from "../features/admin/pages/VendorsPage";
import { AllocationsPage } from "../features/admin/pages/AllocationsPage";
import { PaymentsPage } from "../features/admin/pages/PaymentsPage";
import { DebtorsPage } from "../features/admin/pages/DebtorsPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register-admin", element: <RegisterAdminPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireAdmin />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: "stalls", element: <StandsPage /> },
              { path: "vendors", element: <VendorsPage /> },
              { path: "allocations", element: <AllocationsPage /> },
              { path: "payments", element: <PaymentsPage /> },
              { path: "debtors", element: <DebtorsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <LoginPage /> },
]);
