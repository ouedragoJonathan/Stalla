import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../app/AuthContext";

export function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const result = await loginAdmin(identifier, password);
    setLoading(false);
    if (!result.ok) return setMessage(result.message);
    navigate("/admin");
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <header>
          <span className="brand-chip">STALLA</span>
          <h1>Connexion Admin</h1>
          <p>Accède au tableau de gestion des stands, vendeurs et paiements.</p>
        </header>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Email administrateur
            <input
              placeholder="admin@exemple.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </label>
          <label>
            Mot de passe
            <input
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="primary-btn" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {message && <p className="error">{message}</p>}

        <p className="auth-foot">
          Pas de compte ? <Link to="/register-admin">Créer un administrateur</Link>
        </p>
      </section>
    </main>
  );
}
