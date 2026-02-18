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

const PRICE_OPTIONS = {
  STANDARD: [10000, 15000, 20000, 25000, 30000],
  PREMIUM: [35000, 40000, 45000, 50000],
};

function getStatusUi(status: Stand["status"]) {
  if (status === "OCCUPIED") {
    return { label: "Occupé", className: "status-pill occupied" };
  }
  return { label: "Disponible", className: "status-pill available" };
}

function getNextStandCode(zone: string, category: string, stalls: Stand[]): string {
  const prefix = `${zone.trim().toUpperCase()}-${category === "PREMIUM" ? "P" : "S"}`;
  const maxForZone = stalls.reduce((max, stall) => {
    const code = stall.code.trim().toUpperCase();
    const match = code.match(new RegExp(`^${prefix}(\\d+)$`));
    if (!match) return max;
    const n = Number(match[1]);
    if (!Number.isFinite(n)) return max;
    return Math.max(max, n);
  }, 0);
  return `${prefix}${String(maxForZone + 1).padStart(2, "0")}`;
}

export function StallsPage() {
  const [stalls, setStalls] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [zone, setZone] = useState("A");
  const [category, setCategory] = useState<"STANDARD" | "PREMIUM">("STANDARD");
  const [monthlyPrice, setMonthlyPrice] = useState<number>(PRICE_OPTIONS.STANDARD[0]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const code = useMemo(() => {
    if (!zone.trim()) return "";
    return getNextStandCode(zone, category, stalls);
  }, [zone, category, stalls]);

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

  // Reset price when category changes
  useEffect(() => {
    setMonthlyPrice(PRICE_OPTIONS[category][0]);
  }, [category]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!zone.trim()) {
      setMessage("Veuillez renseigner la zone.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const response = await createStall({
      code: code.trim(),
      zone: zone.trim(),
      category,
      monthly_price: monthlyPrice,
    });
    setSaving(false);
    if (response.success) {
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
            <p>Créer un emplacement avec sa catégorie et son loyer.</p>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Zone</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)} required>
                {ZONES.map((z) => (
                  <option key={z} value={z}>
                    {ZONE_LABELS[z]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as "STANDARD" | "PREMIUM")}
                required
              >
                <option value="STANDARD">Standard (10 000 – 30 000 CFA)</option>
                <option value="PREMIUM">Premium (35 000 – 50 000 CFA)</option>
              </select>
            </div>
            <div className="form-field">
              <label>Loyer mensuel (CFA)</label>
              <select
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                required
              >
                {PRICE_OPTIONS[category].map((price) => (
                  <option key={price} value={price}>
                    {price.toLocaleString()} CFA
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Code généré</label>
              <input value={code} readOnly />
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
                  <th align="left">Catégorie</th>
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
                      <td>{ZONE_LABELS[stall.zone] || `Zone ${stall.zone}`}</td>
                      <td>
                        <span className={`status-pill ${stall.category === "PREMIUM" ? "occupied" : "available"}`}>
                          {stall.category ?? "STANDARD"}
                        </span>
                      </td>
                      <td>{Number(stall.monthly_price).toLocaleString()} CFA</td>
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
