import { useEffect, useMemo, useState } from "react";
import type { Debtor, Stand, Vendor } from "../../../core/types";
import { getDebtors, getStalls, getVendors } from "../adminService";

type DashboardData = {
  stalls: Stand[];
  vendors: Vendor[];
  debtors: Debtor[];
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ stalls: [], vendors: [], debtors: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const [stallsRes, vendorsRes, debtorsRes] = await Promise.all([
        getStalls(),
        getVendors(),
        getDebtors(),
      ]);

      if (!mounted) return;

      const next: DashboardData = {
        stalls: stallsRes.success ? stallsRes.data : [],
        vendors: vendorsRes.success ? vendorsRes.data : [],
        debtors: debtorsRes.success ? debtorsRes.data : [],
      };
      setData(next);

      const errors = [stallsRes, vendorsRes, debtorsRes]
        .filter((res) => !res.success)
        .map((res) => res.message);

      setMessage(errors.length ? errors.join(" | ") : null);
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const totalStalls = data.stalls.length;
    const occupiedStalls = data.stalls.filter((stall) => stall.status === "OCCUPIED").length;
    const availableStalls = totalStalls - occupiedStalls;
    const totalVendors = data.vendors.length;
    const totalDebtors = data.debtors.length;
    const totalDebt = data.debtors.reduce((sum, debtor) => sum + debtor.current_debt, 0);
    const totalDue = data.debtors.reduce((sum, debtor) => sum + debtor.total_due, 0);
    const totalPaid = data.debtors.reduce((sum, debtor) => sum + debtor.total_paid, 0);

    const occupancyRate = totalStalls > 0 ? Math.round((occupiedStalls / totalStalls) * 100) : 0;
    const recoveryRate = (totalPaid + totalDebt) > 0
      ? Math.round((totalPaid / (totalPaid + totalDebt)) * 100)
      : 0;

    return {
      totalStalls,
      occupiedStalls,
      availableStalls,
      totalVendors,
      totalDebtors,
      totalDebt,
      totalDue,
      totalPaid,
      occupancyRate,
      recoveryRate,
    };
  }, [data]);

  return (
    <section className="dashboard-page">
      {message && <div className="alert">{message}</div>}

      {loading ? (
        <p className="helper-text">Chargement des données...</p>
      ) : (
        <div className="bento-layout">
          <div className="hero-card">
            <h3>Bienvenue sur STALLA</h3>
            <p>
              L&apos;occupation actuelle est à <strong>{kpis.occupancyRate}%</strong>. Vous suivez
              {" "}<strong>{kpis.totalDebtors}</strong> débiteurs actifs.
            </p>
            <div className="hero-actions">
              <span className="chip">Stands: {kpis.totalStalls}</span>
              <span className="chip">Vendeurs: {kpis.totalVendors}</span>
            </div>
          </div>

          <div className="stat-grid">
            <article className="stat-tile">
              <span>Stands occupés</span>
              <strong>{kpis.occupiedStalls}</strong>
            </article>
            <article className="stat-tile">
              <span>Stands disponibles</span>
              <strong>{kpis.availableStalls}</strong>
            </article>
            <article className="stat-tile">
              <span>Vendeurs</span>
              <strong>{kpis.totalVendors}</strong>
            </article>
            <article className="stat-tile">
              <span>Débiteurs</span>
              <strong>{kpis.totalDebtors}</strong>
            </article>
          </div>

          <div className="chart-card">
            <div className="section-head">
              <h4>Occupation des stands</h4>
              <b>{kpis.occupancyRate}%</b>
            </div>
            <div className="progress-track">
              <div className="progress-value" style={{ width: `${kpis.occupancyRate}%` }}></div>
            </div>
            <div className="dual-metrics">
              <div>
                <small>Occupés</small>
                <p>{kpis.occupiedStalls}</p>
              </div>
              <div>
                <small>Disponibles</small>
                <p>{kpis.availableStalls}</p>
              </div>
            </div>
          </div>

          <div className="finance-card">
            <div className="section-head">
              <h4>Recouvrement</h4>
              <b>{kpis.recoveryRate}%</b>
            </div>
            <div className="progress-track soft">
              <div className="progress-value grad" style={{ width: `${kpis.recoveryRate}%` }}></div>
            </div>
            <div className="dual-metrics">
              <div>
                <small>Total collecté</small>
                <p>{kpis.totalPaid.toLocaleString()} CFA</p>
              </div>
              <div>
                <small>Reste à recouvrer</small>
                <p>{kpis.totalDebt.toLocaleString()} CFA</p>
              </div>
            </div>
            <div className="finance-foot">
              <small>Total dû</small>
              <b>{kpis.totalDue.toLocaleString()} CFA</b>
            </div>
          </div>

          <div className="activity-card">
            <div className="section-head">
              <h4>Débiteurs récents</h4>
              <b>{data.debtors.length}</b>
            </div>
            <div className="debtor-list-modern">
              {data.debtors.slice(0, 4).map((debtor) => (
                <div className="debtor-row" key={debtor.vendor_id}>
                  <div className="debtor-avatar">{debtor.full_name.charAt(0)}</div>
                  <div>
                    <p>{debtor.full_name}</p>
                    <small>{debtor.business_type}</small>
                  </div>
                  <strong>{debtor.current_debt.toLocaleString()} CFA</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
