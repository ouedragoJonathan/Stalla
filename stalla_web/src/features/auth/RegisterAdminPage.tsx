import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";

export function RegisterAdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const result = await registerAdmin(name, email, password);
    setLoading(false);
    if (!result.ok) return setMessage(result.message);
    navigate("/admin");
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <header>
          <span className="brand-chip">STALLA</span>
          <h1>Créer un admin</h1>
          <p>Initialise l'espace web administrateur de la plateforme.</p>
        </header>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Nom complet
            <input placeholder="Admin principal" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Email
            <input placeholder="admin@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Mot de passe
            <input
              placeholder="Minimum 6 caractères"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="primary-btn" disabled={loading}>
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>

        {message && <p className="error">{message}</p>}

        <p className="auth-foot">
          Déjà inscrit ? <Link to="/login">Connexion</Link>
        </p>
      </section>
    </main>
  );
}
