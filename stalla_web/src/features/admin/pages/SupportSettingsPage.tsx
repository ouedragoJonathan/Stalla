import { useEffect, useState } from "react";
import { getSupportSettings, updateSupportSettings } from "../adminService";

export function SupportSettingsPage() {
  const [supportPhone, setSupportPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const response = await getSupportSettings();
      if (!mounted) return;
      if (response.success) {
        setSupportPhone(response.data.support_phone ?? "");
      } else {
        setMessage(response.message);
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supportPhone.trim()) {
      setMessage("Le numéro support est obligatoire.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const response = await updateSupportSettings({ support_phone: supportPhone.trim() });
    setSaving(false);
    if (response.success) {
      setMessage("Numéro support mis à jour.");
      return;
    }
    setMessage(response.message);
  };

  return (
    <section className="admin-page-space">
      {message && (
        <div className={`alert ${message.includes("mis à jour") ? "success" : ""}`}>{message}</div>
      )}

      <article className="panel-card form-panel support-panel">
        <div className="panel-title">
          <h3>Support client</h3>
          <p>Ce numéro s'affiche dans l'app mobile pour contacter l'admin.</p>
        </div>
        {loading ? (
          <p className="helper-text">Chargement...</p>
        ) : (
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Numéro support</label>
              <input
                value={supportPhone}
                onChange={(event) => setSupportPhone(event.target.value)}
                placeholder="Ex: +243xxxxxxxxx"
                required
              />
            </div>
            <button className="btn-primary accent" type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        )}
      </article>
    </section>
  );
}
