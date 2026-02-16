import twilio from "twilio";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  return twilio(accountSid, authToken);
}

function formatPhone(phone) {
  // Expect E.164. If already looks like +xxx..., leave it.
  if (!phone) return null;
  if (phone.startsWith("+")) return phone;
  return phone;
}

export async function sendVendorWelcomeSms({ to, fullName, password }) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!client || !from) return { ok: false, reason: "Twilio not configured" };

  const toNumber = formatPhone(to);
  if (!toNumber) return { ok: false, reason: "Invalid phone" };

  const body = `Bonjour ${fullName}. Votre compte vendeur STALLA est créé. Identifiant: ${toNumber}. Mot de passe: ${password}.`; 

  const message = await client.messages.create({
    from,
    to: toNumber,
    body,
  });

  return { ok: true, sid: message.sid };
}
