import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", hint: "Vue globale" },
  { to: "/admin/stalls", label: "Stands", hint: "Inventaire" },
  { to: "/admin/vendors", label: "Vendeurs", hint: "Commerçants" },
  { to: "/admin/allocations", label: "Allocations", hint: "Attributions" },
  { to: "/admin/payments", label: "Paiements", hint: "Encaissements" },
  { to: "/admin/debtors", label: "Débiteurs", hint: "Risque" },
];

export function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand-block">
          <span className="brand-chip">STALLA</span>
          <h2>Administration</h2>
          <p>Pilotage opérationnel du marché</p>
        </div>

        <nav className="admin-nav">
          {links.map((link) => (
            <Link key={link.to} className={pathname === link.to ? "active" : ""} to={link.to}>
              <span>{link.label}</span>
              <small>{link.hint}</small>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.email ?? "Admin"}</p>
          </div>
          <button className="ghost-btn" onClick={logout}>
            Déconnexion
          </button>
        </header>

        <div className="page-wrap">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
