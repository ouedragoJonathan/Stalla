import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/AuthContext";

export function LoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await loginAdmin(identifier.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Stalla" />
        </div>
        <h1>Connexion admin</h1>
        <p>Accède à l'espace de gestion du marché.</p>

        {message && <div className="alert">{message}</div>}

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Identifiant (email ou téléphone)</label>
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required />
          </div>
          <div className="form-field">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          <button className="btn-outline" type="button" onClick={() => navigate("/register")}>
            Créer un admin
          </button>
        </form>
      </div>
    </div>
  );
}
