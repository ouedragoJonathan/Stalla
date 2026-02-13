import { FormEvent, useEffect, useState } from "react";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Panel } from "../../../components/ui/Panel";
import { adminService } from "../adminService";
import type { Vendor } from "../../../core/types";

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [form, setForm] = useState({ full_name: "", phone: "", business_type: "", email: "" });
  const [message, setMessage] = useState("");

  async function load() {
    const response = await adminService.listVendors();
    setMessage(response.message);
    if (response.success) setVendors(response.data);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const response = await adminService.createVendor({
      full_name: form.full_name,
      phone: form.phone,
      business_type: form.business_type,
      email: form.email || undefined,
    });
    setMessage(response.message);
    if (response.success) {
      setForm({ full_name: "", phone: "", business_type: "", email: "" });
      void load();
      alert(`Mot de passe initial vendeur: ${response.data.default_password}`);
    }
  }

  return (
    <section>
      <PageHeader title="Gestion des vendeurs" subtitle="Créer les comptes vendeurs et suivre leurs informations." />

      <Panel title="Nouveau vendeur" subtitle="Le téléphone est obligatoire. L'email est optionnel.">
        <form className="form-grid" onSubmit={onSubmit}>
          <label>
            Nom complet
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Nom vendeur"
              required
            />
          </label>
          <label>
            Téléphone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+229..."
              required
            />
          </label>
          <label>
            Activité
            <input
              value={form.business_type}
              onChange={(e) => setForm({ ...form, business_type: e.target.value })}
              placeholder="Textile"
              required
            />
          </label>
          <label>
            Email (optionnel)
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="vendeur@example.com"
            />
          </label>
          <button className="primary-btn">Créer le vendeur</button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </Panel>

      <Panel title="Répertoire vendeurs">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Activité</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.full_name}</td>
                  <td>{v.phone}</td>
                  <td>{v.email ?? "-"}</td>
                  <td>{v.business_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}
