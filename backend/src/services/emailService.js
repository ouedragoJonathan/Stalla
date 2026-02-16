function getBrevoApiKey() {
  return process.env.BREVO_API_KEY || null;
}

export async function sendVendorWelcomeEmail({ to, fullName, password, phone }) {
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
    to: [{ email: to, name: fullName || "Vendeur" }],
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
