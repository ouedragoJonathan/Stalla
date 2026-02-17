import { useEffect, useState } from "react";
import type { Vendor, VendorApplication } from "../../../core/types";
import {
  approveVendorApplication,
  createVendor,
  deleteVendor,
  getVendorApplications,
  getVendors,
  rejectVendorApplication,
} from "../adminService";

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  function deliveryStatusMessage(vendor: Vendor): string {
    const emailDelivery = vendor.email_delivery;

    if (emailDelivery?.ok) return "Identifiants envoyés par email.";

    if (emailDelivery?.reason === "No recipient email") {
      return "Aucun email du vendeur: partagez le mot de passe manuellement.";
    }
    if (emailDelivery?.reason === "Brevo not configured") {
      return "Email non envoyé (Brevo non configuré).";
    }

    if (emailDelivery?.reason) return `Email non envoyé (${emailDelivery.reason}).`;

    return "Email non envoyé. Partagez le mot de passe manuellement.";
  }

  async function load() {
    setLoading(true);
    const [vendorsResponse, applicationsResponse] = await Promise.all([
      getVendors(),
      getVendorApplications(),
    ]);
    if (vendorsResponse.success) {
      setVendors(vendorsResponse.data);
    } else {
      setMessage(vendorsResponse.message);
    }

    if (applicationsResponse.success) {
      setApplications(applicationsResponse.data);
    } else {
      setMessage(applicationsResponse.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim() || !businessType.trim()) {
      setMessage("full_name, phone et business_type sont obligatoires.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const response = await createVendor({
      full_name: fullName.trim(),
      phone: phone.trim(),
      business_type: businessType.trim(),
      email: email.trim() || null,
    });
    setSaving(false);
    if (response.success) {
      await load();
      setFullName("");
      setPhone("");
      setEmail("");
      setBusinessType("");
      const sendMessage = deliveryStatusMessage(response.data);
      setMessage(`Vendeur créé. Mot de passe: ${response.data.default_password}. ${sendMessage}`);
      return;
    }
    setMessage(response.message);
  };

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (!window.confirm(`Supprimer le vendeur ${vendor.full_name} ?`)) return;
    setDeletingId(vendor.id);
    const response = await deleteVendor(vendor.id);
    setDeletingId(null);
    if (response.success) {
      setMessage("Vendeur supprimé avec succès.");
      await load();
      return;
    }
    setMessage(response.message);
  };

  const handleApproveApplication = async (application: VendorApplication) => {
    const confirmed = window.confirm(`Valider la demande de ${application.full_name} ?`);
    if (!confirmed) return;
    setApprovingId(application.id);
    const response = await approveVendorApplication(application.id);
    setApprovingId(null);
    if (response.success) {
      setMessage("Demande validée. Le vendeur a été créé.");
      await load();
      return;
    }
    setMessage(response.message);
  };

  const handleRejectApplication = async (application: VendorApplication) => {
    const confirmed = window.confirm(`Rejeter la demande de ${application.full_name} ?`);
    if (!confirmed) return;
    setRejectingId(application.id);
    const response = await rejectVendorApplication(application.id);
    setRejectingId(null);
    if (response.success) {
      setMessage("Demande rejetée.");
      await load();
      return;
    }
    setMessage(response.message);
  };

  return (
    <section className="admin-page-space">
      {message && (
        <div className={`alert ${message.includes("créé") ? "success" : ""}`}>{message}</div>
      )}

      <div className="admin-split-grid">
        <article className="panel-card table-panel">
          <div className="panel-title row">
            <h3>Demandes d'inscription</h3>
            <span className="panel-pill">{applications.length} en attente</span>
          </div>
          {loading ? (
            <p className="helper-text">Chargement...</p>
          ) : applications.length === 0 ? (
            <p className="helper-text">Aucune demande en attente.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th align="left">Nom</th>
                  <th align="left">Téléphone</th>
                  <th align="left">Email</th>
                  <th align="left">Zone souhaitée</th>
                  <th align="left">Marge prix</th>
                  <th align="center">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id}>
                    <td>{item.full_name}</td>
                    <td>{item.phone}</td>
                    <td>{item.email ?? "-"}</td>
                    <td>{item.desired_zone}</td>
                    <td>
                      {item.budget_min.toLocaleString()} - {item.budget_max.toLocaleString()}
                    </td>
                    <td align="center">
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          className="btn-primary accent"
                          type="button"
                          onClick={() => handleApproveApplication(item)}
                          disabled={approvingId === item.id || rejectingId === item.id}
                        >
                          {approvingId === item.id ? "Validation..." : "Valider"}
                        </button>
                        <button
                          className="icon-btn danger"
                          type="button"
                          onClick={() => handleRejectApplication(item)}
                          disabled={rejectingId === item.id || approvingId === item.id}
                          title="Rejeter"
                        >
                          {rejectingId === item.id ? "..." : "Rejeter"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        <article className="panel-card form-panel">
          <div className="panel-title">
            <h3>Nouveau Vendeur</h3>
            <p>Créer un compte commerçant.</p>
          </div>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Nom complet</label>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </div>
            <div className="form-field">
              <label>Téléphone</label>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </div>
            <div className="form-field">
              <label>Activité</label>
              <input value={businessType} onChange={(event) => setBusinessType(event.target.value)} required />
            </div>
            <div className="form-field">
              <label>Email (optionnel)</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <button className="btn-primary accent" type="submit" disabled={saving}>
              {saving ? "Création..." : "Créer le vendeur"}
            </button>
          </form>
        </article>

        <article className="panel-card table-panel">
          <div className="panel-title row">
            <h3>Liste des vendeurs</h3>
            <span className="panel-pill">{vendors.length} total</span>
          </div>
          {loading ? (
            <p className="helper-text">Chargement...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th align="left">Nom</th>
                  <th align="left">Téléphone</th>
                  <th align="left">Email</th>
                  <th align="left">Activité</th>
                  <th align="center">Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>{vendor.full_name}</td>
                    <td>{vendor.phone}</td>
                    <td>{vendor.email ?? "-"}</td>
                    <td>{vendor.business_type}</td>
                    <td align="center">
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => handleDeleteVendor(vendor)}
                        disabled={deletingId === vendor.id}
                        title="Supprimer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      </div>
    </section>
  );
}
