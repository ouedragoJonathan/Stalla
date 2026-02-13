import { FormEvent, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Panel } from "../../../components/ui/Panel";
import { adminService } from "../adminService";

export function PaymentsPage() {
  const [allocationId, setAllocationId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [period, setPeriod] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await adminService.createPayment({
      allocation_id: Number(allocationId),
      amount_paid: Number(amountPaid),
      period,
    });
    setMessage(response.message);
    if (response.success) {
      setAllocationId("");
      setAmountPaid("");
      setPeriod("");
    }
  }

  return (
    <section>
      <PageHeader title="Paiements" subtitle="Enregistrer les paiements reçus physiquement." />

      <Panel title="Nouveau paiement" subtitle="La période doit être au format YYYY-MM.">
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Allocation ID
            <input value={allocationId} onChange={(e) => setAllocationId(e.target.value)} placeholder="12" required />
          </label>
          <label>
            Montant payé
            <input value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} placeholder="30000" required />
          </label>
          <label>
            Période
            <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-02" required />
          </label>
          <button className="primary-btn">Enregistrer le paiement</button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </Panel>
    </section>
  );
}
