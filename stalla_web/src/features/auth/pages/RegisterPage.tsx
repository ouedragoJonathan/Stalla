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
      <div className="auth-card-modern">
        <div className="auth-head">
          <div className="auth-logo-badge">
            <img src="/logo.png" alt="Stalla" />
          </div>
          <h1>Créer un admin</h1>
          <p className="subtitle">Accédez au panneau de gestion de votre marché.</p>
        </div>

        {message && (
          <div className="alert">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label>Nom complet</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                placeholder="Ex: Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Email</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="admin@stalla.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Mot de passe</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <div className="loader"></div> : "Créer le compte"}
          </button>
        </form>

        <div className="auth-footer">
          Déjà un compte ?
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
