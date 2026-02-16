import { useEffect, useState } from "react";
import type { Debtor } from "../../../core/types";
import { getDebtors } from "../adminService";

export function DebtorsPage() {
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await getDebtors();
    if (response.success) {
      setDebtors(response.data);
    } else {
      setMessage(response.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="admin-page-space">
      {message && <div className="alert">{message}</div>}

      <article className="panel-card table-panel">
        <div className="panel-title row">
          <h3>Liste des débiteurs</h3>
          <span className="panel-pill">{debtors.length} en retard</span>
        </div>
        {loading ? (
          <p className="helper-text">Chargement...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th align="left">Vendeur</th>
                <th align="left">Téléphone</th>
                <th align="left">Activité</th>
                <th align="left">Total dû</th>
                <th align="left">Payé</th>
                <th align="left">Dette</th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((debtor) => (
                <tr key={debtor.vendor_id}>
                  <td>{debtor.full_name}</td>
                  <td>{debtor.phone}</td>
                  <td>{debtor.business_type}</td>
                  <td>{debtor.total_due}</td>
                  <td>{debtor.total_paid}</td>
                  <td>{debtor.current_debt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </article>
    </section>
  );
}
