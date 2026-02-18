import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

type IconName = "home" | "store" | "users" | "merge" | "card" | "alert" | "help" | "logout";

const navLinks = [
  { to: "/admin", label: "Dashboard", icon: "home" as IconName },
  { to: "/admin/stalls", label: "Gestion Stands", icon: "store" as IconName },
  { to: "/admin/vendors", label: "Vendeurs", icon: "users" as IconName },
  { to: "/admin/applications", label: "Candidatures", icon: "alert" as IconName },
  { to: "/admin/allocations", label: "Allocations", icon: "merge" as IconName },
  { to: "/admin/payments", label: "Paiements", icon: "card" as IconName },
  { to: "/admin/debtors", label: "Débiteurs", icon: "alert" as IconName },
];

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/stalls": "Gestion Stands",
  "/admin/vendors": "Vendeurs",
  "/admin/applications": "Candidatures Vendeurs",
  "/admin/allocations": "Allocations",
  "/admin/payments": "Paiements",
  "/admin/debtors": "Débiteurs",
  "/admin/support": "Support",
};

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string[]> = {
    home: ["M3 11l9-8 9 8", "M5 10v10h14V10"],
    store: ["M3 10h18", "M5 10v10h14V10", "M9 20v-5h6v5"],
    users: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0-.01", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
    merge: ["M6 3v6a3 3 0 0 0 3 3h6", "M18 21v-6a3 3 0 0 0-3-3H9", "M18 3v4", "M18 17v4"],
    card: ["M2 7h20", "M2 5h20v14H2z", "M6 15h4"],
    alert: ["M12 8v4", "M12 16h.01", "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"],
    help: ["M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4", "M12 17h.01", "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"],
    logout: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

export function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const pageTitle = pageTitles[pathname] ?? "Dashboard";
  const initials = (user?.name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand-row">
          <img src="/logo.png" alt="Stalla" />
        </div>

        <nav className="admin-nav">
          {navLinks.map((link) => (
            <Link key={link.to} className={pathname === link.to ? "active" : ""} to={link.to}>
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-nav admin-nav-bottom">
          <Link className={pathname === "/admin/support" ? "active" : ""} to="/admin/support">
            <Icon name="help" />
            <span>Support</span>
          </Link>
          <button className="side-logout" onClick={logout} type="button">
            <Icon name="logout" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h2>{pageTitle}</h2>
          <div className="topbar-profile">
            <div className="profile-text">
              <strong>{user?.name ?? "Admin"}</strong>
              <p>Super Admin</p>
            </div>
            <div className="profile-avatar">{initials}</div>
          </div>
        </header>

        <div className="page-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
