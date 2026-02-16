import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/AuthContext";

export function LoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const initialMessage = (location.state as { message?: string } | null)?.message ?? null;
  const [message, setMessage] = useState<string | null>(
    initialMessage,
  );
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    initialMessage ? "success" : null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIdentifier("");
    setPassword("");
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageType(null);
    const result = await loginAdmin(identifier.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      setMessageType("error");
      setIdentifier("");
      setPassword("");
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
          <h1>Bon retour</h1>
          <p className="subtitle">Connectez-vous pour gérer votre marché.</p>
        </div>

        {message && (
          <div className={`alert ${messageType === "success" ? "success" : ""}`}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack" autoComplete="off">
          <div className="form-field">
            <label>Email</label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                placeholder="Email ou téléphone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="off"
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
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1-2.87 2.87-5.1 5.14-6.43" />
                    <path d="M1 1l22 22" />
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11 11 0 0 1-4.24 5.06" />
                    <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <button type="button" className="text-link-btn" onClick={() => navigate("/forgot-password")}>
              Mot de passe oublié ?
            </button>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <div className="loader"></div> : "Se connecter"}
          </button>
        </form>

        <div className="auth-footer">
          Pas encore d'accès ?
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
            Créer un compte admin
          </a>
        </div>
      </div>
    </div>
  );
}
