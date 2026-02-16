import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../authService";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const response = await forgotPassword({ email: email.trim() });
    setLoading(false);
    setMessage(response.message);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card-modern">
        <div className="auth-head">
          <div className="auth-logo-badge">
            <img src="/logo.png" alt="Stalla" />
          </div>
          <h1>Mot de passe oublié</h1>
          <p className="subtitle">Entrez votre email admin pour recevoir un lien de réinitialisation.</p>
        </div>

        {message && <div className={`alert ${message.includes("envoyé") ? "success" : ""}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-field">
            <label>Email admin</label>
            <input
              type="email"
              placeholder="admin@stalla.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>

        <div className="auth-footer">
          <a href="#" onClick={(event) => { event.preventDefault(); navigate("/login"); }}>
            Retour à la connexion
          </a>
        </div>
      </div>
    </div>
  );
}
