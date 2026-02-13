import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Panel } from "../../../components/ui/Panel";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { adminService } from "../adminService";
import type { Stand } from "../../../core/types";

export function StandsPage() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [code, setCode] = useState("");
  const [zone, setZone] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const response = await adminService.listStands();
    setMessage(response.message);
    if (response.success) setStands(response.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await adminService.createStand({
      code,
      zone,
      monthly_price: Number(monthlyPrice),
    });
    setMessage(response.message);
    if (response.success) {
      setCode("");
      setZone("");
      setMonthlyPrice("");
      void load();
    }
  }

  return (
    <section>
      <PageHeader title="Gestion des stands" subtitle="Créer et suivre les emplacements du marché." />

      <Panel title="Nouveau stand">
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Code
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="A-101" required />
          </label>
          <label>
            Zone
            <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder="Zone A" required />
          </label>
          <label>
            Loyer mensuel
            <input value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} placeholder="30000" required />
          </label>
          <button className="primary-btn">Créer le stand</button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </Panel>

      <Panel title="Inventaire des stands">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Zone</th>
                <th>Loyer</th>
                <th>Statut</th>
                <th>Vendeur actif</th>
              </tr>
            </thead>
            <tbody>
              {stands.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.code}</td>
                  <td>{s.zone}</td>
                  <td>{s.monthly_price.toLocaleString("fr-FR")}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td>{s.active_allocation?.vendor_name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}
