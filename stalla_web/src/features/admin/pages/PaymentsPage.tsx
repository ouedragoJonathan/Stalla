import { useEffect, useMemo, useState } from "react";
import type { Stand } from "../../../core/types";
import { createPayment, getStalls } from "../adminService";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function toPeriod(value: string): string {
  return value.slice(0, 7);
}

export function PaymentsPage() {
  const [stalls, setStalls] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [allocationId, setAllocationId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [periodDate, setPeriodDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

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
    if (!allocationId || !amountPaid.trim() || !periodDate.trim()) {
      setMessage("Tous les champs sont obligatoires.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setReceiptUrl(null);
    const response = await createPayment({
      allocation_id: Number(allocationId),
      amount_paid: Number(amountPaid),
      period: toPeriod(periodDate.trim()),
    });
    setSaving(false);
    if (response.success) {
      setAllocationId("");
      setAmountPaid("");
      await load();
      setMessage("Paiement enregistré.");
      setReceiptUrl(response.data.receipt_url ?? null);
      return;
    }
    setMessage(response.message);
  };

  return (
    <section className="admin-page-space">
      {message && (
        <div className={`alert ${message.includes("enregistré") ? "success" : ""}`}>{message}</div>
      )}
      {receiptUrl && (
        <a className="btn-primary accent" href={receiptUrl} target="_blank" rel="noreferrer">
          Télécharger le reçu de paiement
        </a>
      )}

      <div className="admin-split-grid">
        <article className="panel-card form-panel">
          <div className="panel-title">
            <h3>Nouveau Paiement</h3>
            <p>Enregistrer un encaissement.</p>
          </div>
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
                <label>Période</label>
                <input type="date" value={periodDate} onChange={(event) => setPeriodDate(event.target.value)} required />
              </div>
              <button className="btn-primary accent" type="submit" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer le paiement"}
              </button>
            </form>
          )}
        </article>

        <article className="panel-card table-panel">
          <div className="panel-title row">
            <h3>Allocations actives</h3>
            <span className="panel-pill">{activeAllocations.length} actives</span>
          </div>
          <table className="data-table">
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
        </article>
      </div>
    </section>
  );
}
