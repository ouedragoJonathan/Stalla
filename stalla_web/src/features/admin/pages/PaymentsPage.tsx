import { useEffect, useMemo, useState } from "react";
import type { Stand } from "../../../core/types";
import { createPayment, getStalls } from "../adminService";

function currentPeriod(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function PaymentsPage() {
  const [stalls, setStalls] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [allocationId, setAllocationId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [period, setPeriod] = useState(currentPeriod());
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

  const activeAllocations = useMemo(
    () => stalls.filter((stall) => stall.active_allocation).map((stall) => ({ stall, allocation: stall.active_allocation! })),
    [stalls],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!allocationId || !amountPaid.trim() || !period.trim()) {
      setMessage("Tous les champs sont obligatoires.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const response = await createPayment({
      allocation_id: Number(allocationId),
      amount_paid: Number(amountPaid),
      period: period.trim(),
    });
    setSaving(false);
    if (response.success) {
      setAllocationId("");
      setAmountPaid("");
      await load();
      setMessage("Paiement enregistré.");
      return;
    }
    setMessage(response.message);
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <h1>Paiements</h1>
          <p className="helper-text">Enregistrer un paiement physique.</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes("enregistré") ? "success" : ""}`}>{message}</div>
      )}

      {loading ? (
        <p className="helper-text">Chargement...</p>
      ) : (
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Allocation active</label>
            <select value={allocationId} onChange={(event) => setAllocationId(event.target.value)} required>
              <option value="">Sélectionner</option>
              {activeAllocations.map(({ stall, allocation }) => (
                <option key={allocation.id} value={allocation.id}>
                  {stall.code} - {allocation.vendor_name ?? "Vendeur"} (#{allocation.id})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Montant payé</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label>Période (YYYY-MM)</label>
            <input value={period} onChange={(event) => setPeriod(event.target.value)} required />
          </div>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer le paiement"}
          </button>
        </form>
      )}

      <div style={{ marginTop: 24 }}>
        <table width="100%">
          <thead>
            <tr>
              <th align="left">Stand</th>
              <th align="left">Vendeur</th>
              <th align="left">Allocation ID</th>
            </tr>
          </thead>
          <tbody>
            {activeAllocations.map(({ stall, allocation }) => (
              <tr key={allocation.id}>
                <td>{stall.code}</td>
                <td>{allocation.vendor_name ?? "-"}</td>
                <td>{allocation.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
