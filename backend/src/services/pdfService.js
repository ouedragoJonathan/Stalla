import path from "path";
import fs from "fs";
import { execFileSync } from "child_process";

const receiptsDir = path.join(process.cwd(), "receipts");
const logoPath = path.resolve(process.cwd(), "..", "stalla_web", "public", "logo.png");

/**
 * Génère un reçu de paiement en PDF (sans dépendance externe).
 * Retourne le chemin relatif du fichier.
 */
export async function generatePaymentReceipt({ payment, vendor, stand }) {
  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const filename = `receipt_${payment.id}_${Date.now()}.pdf`;
  const filePath = path.join(receiptsDir, filename);
  const amountRaw = payment.amount_paid ?? payment.amount ?? payment.amountPaid ?? "-";
  const amount = Number.isFinite(Number(amountRaw))
    ? `${Number(amountRaw).toLocaleString("fr-FR")} CFA`
    : String(amountRaw);
  const period = payment.period ?? payment.monthPaid ?? "-";
  const paidAt = payment.payment_date ?? payment.paymentDate ?? new Date().toISOString().slice(0, 10);

  const text = {
    receiptNo: sanitizeText(`#${payment.id}`),
    paidAt: sanitizeText(paidAt),
    vendorName: sanitizeText(vendor.full_name || "-"),
    vendorEmail: sanitizeText(vendor.email || "-"),
    vendorPhone: sanitizeText(vendor.phone || "-"),
    standCode: sanitizeText(stand.code || "-"),
    standZone: sanitizeText(stand.zone || "-"),
    amount: sanitizeText(amount),
    period: sanitizeText(period),
  };

  try {
    const args = [
      "-size", "1240x1754", "xc:white",
      "-fill", "#FFF7ED", "-draw", "rectangle 0,0 1240,260",
      "-fill", "#F97316", "-draw", "rectangle 0,210 1240,260",
      "-fill", "#FFFFFF", "-stroke", "#E5E7EB", "-strokewidth", "2",
      "-draw", "roundrectangle 60,300 1180,1650 24,24",
      "-fill", "#F9FAFB", "-stroke", "#E5E7EB", "-strokewidth", "1",
      "-draw", "roundrectangle 90,730 1150,920 16,16",
      "-fill", "#FFF7ED", "-stroke", "#FDBA74", "-strokewidth", "1",
      "-draw", "roundrectangle 90,980 1150,1250 16,16",
      "-fill", "#F9FAFB", "-stroke", "#E5E7EB", "-strokewidth", "1",
      "-draw", "roundrectangle 90,1310 1150,1560 16,16",
    ];

    if (fs.existsSync(logoPath)) {
      args.push("(", logoPath, "-resize", "170x170", ")", "-gravity", "NorthWest", "-geometry", "+85+35", "-composite");
    }

    args.push(
      "-font", "DejaVu-Sans-Bold", "-pointsize", "54", "-fill", "#111827", "-gravity", "NorthWest",
      "-annotate", "+290+112", "Recu de Paiement",
      "-font", "DejaVu-Sans", "-pointsize", "26", "-fill", "#4B5563",
      "-annotate", "+292+164", "STALLA - Gestion des Stands",
      "-font", "DejaVu-Sans-Bold", "-pointsize", "28", "-fill", "#FFFFFF",
      "-annotate", "+92+246", `No: ${text.receiptNo}`,
      "-annotate", "+900+246", `Date: ${text.paidAt}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "32", "-fill", "#111827",
      "-annotate", "+95+385", "Informations Vendeur",
      "-font", "DejaVu-Sans", "-pointsize", "27", "-fill", "#1F2937",
      "-annotate", "+95+450", `Nom: ${text.vendorName}`,
      "-annotate", "+95+510", `Email: ${text.vendorEmail}`,
      "-annotate", "+95+570", `Telephone: ${text.vendorPhone}`,
      "-annotate", "+95+630", `Stand: ${text.standCode}  |  Zone: ${text.standZone}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "30", "-fill", "#111827",
      "-annotate", "+95+790", "Ligne de Paiement",
      "-font", "DejaVu-Sans-Bold", "-pointsize", "24", "-fill", "#6B7280",
      "-annotate", "+95+850", "Description",
      "-annotate", "+700+850", "Periode",
      "-annotate", "+980+850", "Montant",
      "-fill", "#E5E7EB", "-draw", "line 95,870 1145,870",
      "-font", "DejaVu-Sans", "-pointsize", "27", "-fill", "#111827",
      "-annotate", "+95+905", "Paiement location stand",
      "-annotate", "+700+905", `${text.period}`,
      "-font", "DejaVu-Sans-Bold", "-pointsize", "29", "-fill", "#111827",
      "-annotate", "+965+905", `${text.amount}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "30", "-fill", "#111827",
      "-annotate", "+95+1375", "Resume",
      "-font", "DejaVu-Sans", "-pointsize", "27", "-fill", "#374151",
      "-annotate", "+95+1440", "Mode: Encaissement STALLA",
      "-annotate", "+95+1495", "Statut: Paiement enregistre",
      "-font", "DejaVu-Sans-Bold", "-pointsize", "38", "-fill", "#EA580C",
      "-annotate", "+790+1498", `Total: ${text.amount}`,

      "-font", "DejaVu-Sans", "-pointsize", "22", "-fill", "#6B7280",
      "-annotate", "+95+1618", "Merci pour votre paiement.",
      "-annotate", "+95+1650", "Document genere automatiquement par STALLA.",
      filePath
    );

    execFileSync("convert", args, { stdio: "ignore" });
  } catch {
    const fallbackLines = [
      "STALLA - RECU DE PAIEMENT",
      "----------------------------------------",
      `No recu: ${text.receiptNo}`,
      `Date: ${text.paidAt}`,
      "",
      "Informations vendeur",
      `Vendeur: ${text.vendorName}`,
      `Email: ${text.vendorEmail}`,
      `Telephone: ${text.vendorPhone}`,
      `Stand: ${text.standCode} - ${text.standZone}`,
      "",
      "Paiement",
      "Description: Paiement location stand",
      `Periode: ${text.period}`,
      `Montant: ${text.amount}`,
      "",
      "Resume",
      `Total: ${text.amount}`,
      "Statut: Paiement enregistre",
      "----------------------------------------",
      "Merci pour votre paiement.",
    ];
    fs.writeFileSync(filePath, buildSimpleTextPdf(fallbackLines));
  }

  return { filePath: `/receipts/${filename}` };
}

function sanitizeText(value) {
  return String(value ?? "-").replace(/\r?\n/g, " ").trim();
}

function escapePdfText(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimpleTextPdf(lines) {
  const streamParts = [];
  let y = 790;
  for (const line of lines) {
    streamParts.push("BT");
    streamParts.push("/F1 13 Tf");
    streamParts.push(`1 0 0 1 50 ${y} Tm`);
    streamParts.push(`(${escapePdfText(line)}) Tj`);
    streamParts.push("ET");
    y -= 24;
  }
  const stream = `${streamParts.join("\n")}\n`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  const buffers = [];
  const offsets = [0];
  let cursor = 0;

  const push = (content) => {
    const b = Buffer.from(content, "utf8");
    buffers.push(b);
    cursor += b.length;
  };

  push("%PDF-1.4\n");
  objects.forEach((obj, idx) => {
    offsets.push(cursor);
    push(`${idx + 1} 0 obj\n${obj}\nendobj\n`);
  });

  const xrefOffset = cursor;
  push(`xref\n0 ${objects.length + 1}\n`);
  push("0000000000 65535 f \n");
  for (let i = 1; i < offsets.length; i += 1) {
    push(`${String(offsets[i]).padStart(10, "0")} 00000 n \n`);
  }
  push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
  return Buffer.concat(buffers);
}
