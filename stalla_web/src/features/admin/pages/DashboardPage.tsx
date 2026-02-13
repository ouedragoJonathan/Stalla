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

    return [
      { label: "Stands total", value: totalStalls },
      { label: "Stands occupés", value: occupiedStalls },
      { label: "Stands disponibles", value: availableStalls },
      { label: "Vendeurs", value: totalVendors },
      { label: "Vendeurs débiteurs", value: totalDebtors },
      { label: "Dette totale", value: totalDebt },
      { label: "Total dû (débit.)", value: totalDue },
      { label: "Total payé (débit.)", value: totalPaid },
    ];
  }, [data]);

  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="helper-text">Vue globale du marché.</p>
        </div>
      </div>

      {message && <div className="alert">{message}</div>}

      {loading ? (
        <p className="helper-text">Chargement...</p>
      ) : (
        <div className="kpi-grid">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="kpi-card">
              <p className="kpi-label">{kpi.label}</p>
              <h2 className="kpi-value">{kpi.value}</h2>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
