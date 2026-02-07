import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receiptsDir = path.join(process.cwd(), "receipts");

/**
 * Génère un reçu de paiement (fichier texte simple si pas de lib PDF).
 * Retourne le chemin relatif du fichier.
 */
export async function generatePaymentReceipt({ payment, vendor, stand }) {
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }
  const filename = `receipt_${payment.id}_${Date.now()}.txt`;
  const filePath = path.join(receiptsDir, filename);
  const content = [
    "--- Reçu de paiement ---",
    `Vendeur: ${vendor.name} (${vendor.email})`,
    `Stand: ${stand.code} - ${stand.zone}`,
    `Montant: ${payment.amount}`,
    `Mois: ${payment.monthPaid}`,
    `Méthode: ${payment.method}`,
    `Date: ${new Date().toISOString()}`,
    "------------------------",
  ].join("\n");
  fs.writeFileSync(filePath, content, "utf8");
  return { filePath: `/receipts/${filename}` };
}
