import { useEffect, useMemo, useState } from "react";
import type { Stand, Vendor } from "../../../core/types";
import { createAllocation, getStalls, getVendors } from "../adminService";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AllocationsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stalls, setStalls] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState("");
  const [stallId, setStallId] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const [vendorsResponse, stallsResponse] = await Promise.all([getVendors(), getStalls()]);
    if (vendorsResponse.success) {
      setVendors(vendorsResponse.data);
    } else {
      setMessage(vendorsResponse.message);
    }
    if (stallsResponse.success) {
      setStalls(stallsResponse.data);
    } else {
      setMessage(stallsResponse.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const availableStalls = useMemo(
    () => stalls.filter((stall) => stall.status === "AVAILABLE"),
    [stalls],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vendorId || !stallId || !startDate) {
      setMessage("Tous les champs sont obligatoires.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const response = await createAllocation({
      vendor_id: Number(vendorId),
      stall_id: Number(stallId),
      start_date: startDate,
    });
    setSaving(false);
    if (response.success) {
      await load();
      setVendorId("");
      setStallId("");
      setMessage("Attribution créée avec succès.");
      return;
    }
    setMessage(response.message);
  };

  return (
    <section className="admin-page-space">
      {message && (
        <div className={`alert ${message.includes("succès") ? "success" : ""}`}>{message}</div>
      )}

      <div className="admin-split-grid">
        <article className="panel-card form-panel">
          <div className="panel-title">
            <h3>Nouvelle Allocation</h3>
            <p>Attribuer un stand à un vendeur.</p>
          </div>
          {loading ? (
            <p className="helper-text">Chargement...</p>
          ) : (
            <form className="form-stack" onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Vendeur</label>
                <select value={vendorId} onChange={(event) => setVendorId(event.target.value)} required>
                  <option value="">Sélectionner</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.full_name} ({vendor.phone})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Stand disponible</label>
                <select value={stallId} onChange={(event) => setStallId(event.target.value)} required>
                  <option value="">Sélectionner</option>
                  {availableStalls.map((stall) => (
                    <option key={stall.id} value={stall.id}>
                      {stall.code} - {stall.zone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Date de début</label>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
              </div>
              <button className="btn-primary accent" type="submit" disabled={saving}>
                {saving ? "Attribution..." : "Créer l'allocation"}
              </button>
            </form>
          )}
        </article>

        <article className="panel-card table-panel">
          <div className="panel-title row">
            <h3>Stands & attributions</h3>
            <span className="panel-pill">{availableStalls.length} disponibles</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th align="left">Stand</th>
                <th align="left">Statut</th>
                <th align="left">Vendeur actif</th>
                <th align="left">Début</th>
              </tr>
            </thead>
            <tbody>
              {stalls.map((stall) => (
                <tr key={stall.id}>
                  <td>{stall.code}</td>
                  <td>{stall.status}</td>
                  <td>{stall.active_allocation?.vendor_name ?? "-"}</td>
                  <td>{stall.active_allocation?.start_date ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}
