function getBrevoApiKey() {
  return process.env.BREVO_API_KEY || null;
}

async function sendBrevoEmail({ to, toName, subject, htmlContent }) {
  const apiKey = getBrevoApiKey();
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "STALLA";

  if (!apiKey || !senderEmail) {
    return { ok: false, reason: "Brevo not configured" };
  }

  if (!to) {
    return { ok: false, reason: "No recipient email" };
  }

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to, name: toName || "Utilisateur" }],
    subject,
    htmlContent,
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { ok: false, reason: `Brevo error ${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { ok: true, messageId: data.messageId };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

export async function sendVendorWelcomeEmail({ to, fullName, password, phone }) {
  return sendBrevoEmail({
    to,
    toName: fullName || "Vendeur",
    subject: "Vos identifiants STALLA",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">Bienvenue sur STALLA</h2>
        <p>Bonjour ${fullName || ""}, votre compte vendeur est créé.</p>
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Téléphone:</strong> ${phone || "-"}</p>
        <p><strong>Mot de passe:</strong> ${password}</p>
      </div>
    `,
  });
}

export async function sendAdminResetEmail({ to, adminName, resetUrl }) {
  return sendBrevoEmail({
    to,
    toName: adminName || "Administrateur",
    subject: "Réinitialisation du mot de passe STALLA",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">Mot de passe oublié</h2>
        <p>Bonjour ${adminName || ""},</p>
        <p>Cliquez sur ce lien pour définir un nouveau mot de passe:</p>
        <p><a href="${resetUrl}" target="_blank" rel="noopener noreferrer">${resetUrl}</a></p>
        <p>Ce lien expire dans 30 minutes.</p>
      </div>
    `,
  });
}

export async function sendVendorApplicationRejectedEmail({ to, fullName }) {
  return sendBrevoEmail({
    to,
    toName: fullName || "Vendeur",
    subject: "Mise à jour de votre demande STALLA",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">Demande non retenue</h2>
        <p>Bonjour ${fullName || ""},</p>
        <p>Votre demande d'inscription vendeur n'a pas été retenue.</p>
        <p>Vous pouvez soumettre une nouvelle demande avec d'autres préférences de zone/prix.</p>
        <p>L'équipe STALLA reste disponible pour vous accompagner.</p>
      </div>
    `,
  });
}
