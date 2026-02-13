<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Panel } from "../../../components/ui/Panel";
import { StatCard } from "../../../components/ui/StatCard";
import { adminService } from "../adminService";
import type { Debtor, Stand, Vendor } from "../../../core/types";

export function DashboardPage() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const [s, v, d] = await Promise.all([
        adminService.listStands(),
        adminService.listVendors(),
        adminService.listDebtors(),
      ]);

      if (s.success) setStands(s.data);
      if (v.success) setVendors(v.data);
      if (d.success) setDebtors(d.data);
      setMessage(d.message || s.message || v.message);
    }

    void load();
  }, []);

  const occupied = useMemo(() => stands.filter((s) => s.status === "OCCUPIED").length, [stands]);
  const occupancyRate = useMemo(() => {
    if (!stands.length) return 0;
    return Math.round((occupied / stands.length) * 100);
  }, [stands, occupied]);

  const totalDebt = useMemo(
    () => debtors.reduce((sum, debtor) => sum + debtor.current_debt, 0),
    [debtors],
  );

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Vue rapide des opérations, de l'occupation et du risque financier."
      />

      <div className="stats-grid">
        <StatCard label="Stands" value={stands.length} />
        <StatCard label="Vendeurs" value={vendors.length} />
        <StatCard label="Occupation" value={`${occupancyRate}%`} tone={occupancyRate > 70 ? "success" : "warning"} />
        <StatCard label="Dette totale" value={totalDebt.toLocaleString("fr-FR")} tone="danger" />
      </div>

      <Panel title="Points d'attention" subtitle={message || "Synthèse automatique"}>
        <ul className="insight-list">
          <li>{occupied} stands occupés sur {stands.length}.</li>
          <li>{debtors.length} vendeurs actuellement débiteurs.</li>
          <li>Dette cumulée: {totalDebt.toLocaleString("fr-FR")}.</li>
        </ul>
      </Panel>
=======
export function DashboardPage() {
  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="helper-text">Vue globale du marché.</p>
        </div>
      </div>
      <p className="helper-text">Connecté au backend, ajoute tes widgets clés ici.</p>
>>>>>>> temp-sync-web
    </section>
  );
}
