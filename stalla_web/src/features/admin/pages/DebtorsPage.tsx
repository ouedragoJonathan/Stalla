<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Panel } from "../../../components/ui/Panel";
import { StatCard } from "../../../components/ui/StatCard";
import { adminService } from "../adminService";
import type { Debtor } from "../../../core/types";

export function DebtorsPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await adminService.listDebtors();
    setMessage(response.message);
    if (response.success) setDebtors(response.data);
  }

  useEffect(() => {
    void load();
  }, []);

  const totalDebt = useMemo(
    () => debtors.reduce((sum, debtor) => sum + debtor.current_debt, 0),
    [debtors],
  );

  return (
    <section>
      <PageHeader title="Rapport Débiteurs" subtitle="Suivi des impayés vendeurs et exposition financière." />

      <div className="stats-grid">
        <StatCard label="Vendeurs débiteurs" value={debtors.length} tone="warning" />
        <StatCard label="Dette cumulée" value={totalDebt.toLocaleString("fr-FR")} tone="danger" />
      </div>

      <Panel title="Détail des débiteurs" subtitle={message}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Total dû</th>
                <th>Total payé</th>
                <th>Dette</th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((d) => (
                <tr key={d.vendor_id}>
                  <td>{d.full_name}</td>
                  <td>{d.phone}</td>
                  <td>{d.email ?? "-"}</td>
                  <td>{d.total_due.toLocaleString("fr-FR")}</td>
                  <td>{d.total_paid.toLocaleString("fr-FR")}</td>
                  <td>{d.current_debt.toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
=======
export function DebtorsPage() {
  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <h1>Débiteurs</h1>
          <p className="helper-text">Suivi des retards et impayés.</p>
        </div>
      </div>
      <p className="helper-text">À brancher sur /api/admin/debtors.</p>
>>>>>>> temp-sync-web
    </section>
  );
}
