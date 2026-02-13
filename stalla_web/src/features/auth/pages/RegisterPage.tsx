import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/AuthContext";

export function RegisterPage() {
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const result = await registerAdmin(name.trim(), email.trim(), password);
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
        <h1>Créer un admin</h1>
        <p>Crée le compte administrateur principal.</p>

        {message && <div className="alert">{message}</div>}

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Nom complet</label>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
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
            {loading ? "Création..." : "Créer le compte"}
          </button>
          <button
            className="btn-outline"
            type="button"
            onClick={() => navigate("/login")}
          >
            Retour connexion
          </button>
        </form>
      </div>
    </div>
  );
}
