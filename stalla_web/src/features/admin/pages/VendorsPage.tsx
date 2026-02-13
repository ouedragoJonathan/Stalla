import { useEffect, useState } from "react";
import type { Vendor } from "../../../core/types";
import { createVendor, getVendors } from "../adminService";

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const response = await getVendors();
    if (response.success) {
      setVendors(response.data);
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
      const sms = response.data.sms;
      const smsMessage = sms
        ? sms.ok
          ? "SMS envoyé"
          : `SMS non envoyé (${sms.reason ?? "erreur"})`
        : "SMS non disponible";
      setMessage(`Vendeur créé. Mot de passe: ${response.data.default_password}. ${smsMessage}.`);
      return;
    }
    setMessage(response.message);
  };

  return (
    <section className="page-card">
      <div className="page-header">
        <div>
          <h1>Vendeurs</h1>
          <p className="helper-text">Gestion des comptes vendeurs.</p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes("créé") ? "success" : ""}`}>{message}</div>
      )}

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
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Création..." : "Créer le vendeur"}
        </button>
      </form>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <p className="helper-text">Chargement...</p>
        ) : (
          <table width="100%">
            <thead>
              <tr>
                <th align="left">Nom</th>
                <th align="left">Téléphone</th>
                <th align="left">Email</th>
                <th align="left">Activité</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.full_name}</td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.email ?? "-"}</td>
                  <td>{vendor.business_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
