import { useEffect, useMemo, useState } from "react";
import type { Stand } from "../../../core/types";
import { createStall, deleteStall, getStalls } from "../adminService";

const ZONES = ["A", "B", "C", "D"] as const;
const ZONE_LABELS: Record<string, string> = {
  A: "Zone A - Entrée",
  B: "Zone B - Produits frais",
  C: "Zone C - Textile",
  D: "Zone D - Divers",
};

function formatZone(zone: string): string {
  const key = zone.trim().toUpperCase().replace(/^ZONE\s*/i, "").charAt(0);
  if (ZONE_LABELS[key]) return ZONE_LABELS[key];
  return zone;
}

function getStatusUi(status: Stand["status"]) {
  if (status === "OCCUPIED") {
    return { label: "Occupé", className: "status-pill occupied" };
  }
  return { label: "Disponible", className: "status-pill available" };
}

function getNextStandCode(zone: string, stalls: Stand[]): string {
  const normalizedZone = zone.trim().toUpperCase();
  const maxForZone = stalls.reduce((max, stall) => {
    const code = stall.code.trim().toUpperCase();
    const match = code.match(new RegExp(`^${normalizedZone}[- ]?(\\d+)$`));
    if (!match) return max;
    const n = Number(match[1]);
    if (!Number.isFinite(n)) return max;
    return Math.max(max, n);
  }, 0);

  return `${normalizedZone}-${String(maxForZone + 1).padStart(2, "0")}`;
}

export function StallsPage() {
  const [stalls, setStalls] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [zone, setZone] = useState<(typeof ZONES)[number]>("A");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const code = useMemo(() => getNextStandCode(zone, stalls), [zone, stalls]);

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
      setMonthlyPrice("");
      await load();
      setMessage("Stand créé avec succès.");
      return;
    }
    setMessage(response.message);
  };

  const handleDeleteStand = async (stand: Stand) => {
    if (!window.confirm(`Supprimer le stand ${stand.code} ?`)) return;
    setDeletingId(stand.id);
    const response = await deleteStall(stand.id);
    setDeletingId(null);
    if (response.success) {
      setMessage("Stand supprimé avec succès.");
      await load();
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
            <h3>Nouveau Stand</h3>
            <p>Créer rapidement un emplacement.</p>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Code</label>
              <input value={code} readOnly />
            </div>
            <div className="form-field">
              <label>Zone</label>
              <select value={zone} onChange={(event) => setZone(event.target.value as (typeof ZONES)[number])} required>
                {ZONES.map((zoneValue) => (
                  <option key={zoneValue} value={zoneValue}>
                    {ZONE_LABELS[zoneValue]}
                  </option>
                ))}
              </select>
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
            <button className="btn-primary accent" type="submit" disabled={saving}>
              {saving ? "Création..." : "Ajouter le stand"}
            </button>
          </form>
        </article>

        <article className="panel-card table-panel">
          <div className="panel-title row">
            <h3>Liste des Stands</h3>
            <span className="panel-pill">{stalls.length} total</span>
          </div>

          {loading ? (
            <p className="helper-text">Chargement...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th align="left">Code</th>
                  <th align="left">Zone</th>
                  <th align="left">Loyer</th>
                  <th align="left">Statut</th>
                  <th align="left">Vendeur actif</th>
                  <th align="center">Action</th>
                </tr>
              </thead>
              <tbody>
                {stalls.map((stall) => {
                  const statusUi = getStatusUi(stall.status);
                  return (
                  <tr key={stall.id}>
                    <td>{stall.code}</td>
                    <td>{formatZone(stall.zone)}</td>
                    <td>{stall.monthly_price}</td>
                    <td>
                      <span className={statusUi.className}>{statusUi.label}</span>
                    </td>
                    <td>{stall.active_allocation?.vendor_name ?? "-"}</td>
                    <td align="center">
                      {stall.status !== "OCCUPIED" ? (
                        <button
                          type="button"
                          className="icon-btn danger"
                          onClick={() => handleDeleteStand(stall)}
                          disabled={deletingId === stall.id}
                          title="Supprimer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          )}
        </article>
      </div>
    </section>
  );
}
