<<<<<<< HEAD
import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Panel } from "../../../components/ui/Panel";
import { adminService } from "../adminService";
import type { Stand, Vendor } from "../../../core/types";

export function AllocationsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stands, setStands] = useState<Stand[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [stallId, setStallId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBaseData() {
      const [vendorsResponse, standsResponse] = await Promise.all([
        adminService.listVendors(),
        adminService.listStands(),
      ]);
      if (vendorsResponse.success) setVendors(vendorsResponse.data);
      if (standsResponse.success) setStands(standsResponse.data);
    }

    void loadBaseData();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await adminService.createAllocation({
      vendor_id: Number(vendorId),
      stall_id: Number(stallId),
      start_date: startDate,
    });
    setMessage(response.message);
    if (response.success) {
      setVendorId("");
      setStallId("");
      setStartDate("");
    }
  }

  return (
    <section>
      <PageHeader title="Allocations" subtitle="Attribuer un vendeur à un stand disponible." />

      <Panel title="Nouvelle attribution">
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Vendeur
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} required>
              <option value="">Sélectionner</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.full_name} ({v.phone})
                </option>
              ))}
            </select>
          </label>

          <label>
            Stand
            <select value={stallId} onChange={(e) => setStallId(e.target.value)} required>
              <option value="">Sélectionner</option>
              {stands.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.zone} ({s.status})
                </option>
              ))}
            </select>
          </label>

          <label>
            Date de début
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>

          <button className="primary-btn">Assigner le stand</button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </Panel>
=======
export function AllocationsPage() {
  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <h1>Allocations</h1>
          <p className="helper-text">Attributions des stands aux vendeurs.</p>
        </div>
      </div>
      <p className="helper-text">À brancher sur /api/admin/allocations.</p>
>>>>>>> temp-sync-web
    </section>
  );
}
