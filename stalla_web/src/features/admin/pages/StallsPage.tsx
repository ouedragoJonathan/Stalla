import { useEffect, useState } from "react";
import type { Stand } from "../../../core/types";
import { createStall, getStalls } from "../adminService";

export function StallsPage() {
  const [stalls, setStalls] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [zone, setZone] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const response = await getStalls();
    if (response.success) {
      setStalls(response.data);
    } else {
      setMessage(response.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim() || !zone.trim() || !monthlyPrice.trim()) {
      setMessage("Tous les champs sont obligatoires.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const response = await createStall({
      code: code.trim(),
      zone: zone.trim(),
      monthly_price: Number(monthlyPrice),
    });
    setSaving(false);
    if (response.success) {
      setCode("");
      setZone("");
      setMonthlyPrice("");
      await load();
      setMessage("Stand créé avec succès.");
      return;
    }
    setMessage(response.message);
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <h1>Stands</h1>
          <p className="helper-text">Inventaire des stands et disponibilités.</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes("succès") ? "success" : ""}`}>{message}</div>
      )}

      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Code</label>
          <input value={code} onChange={(event) => setCode(event.target.value)} required />
        </div>
        <div className="form-field">
          <label>Zone</label>
          <input value={zone} onChange={(event) => setZone(event.target.value)} required />
        </div>
        <div className="form-field">
          <label>Loyer mensuel</label>
          <input
            type="number"
            value={monthlyPrice}
            onChange={(event) => setMonthlyPrice(event.target.value)}
            required
          />
        </div>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Création..." : "Créer le stand"}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <p className="helper-text">Chargement...</p>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                <th align="left">Code</th>
                <th align="left">Zone</th>
                <th align="left">Loyer</th>
                <th align="left">Statut</th>
                <th align="left">Vendeur actif</th>
              </tr>
            </thead>
            <tbody>
              {stalls.map((stall) => (
                <tr key={stall.id}>
                  <td>{stall.code}</td>
                  <td>{stall.zone}</td>
                  <td>{stall.monthly_price}</td>
                  <td>{stall.status}</td>
                  <td>{stall.active_allocation?.vendor_name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
