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
      "-fill", "#FFF3E0", "-draw", "rectangle 0,0 1240,240",
      "-fill", "#F5F5F5", "-draw", "rectangle 70,360 1170,362",
      "-fill", "#F5F5F5", "-draw", "rectangle 70,980 1170,982",
    ];

    if (fs.existsSync(logoPath)) {
      args.push("(", logoPath, "-resize", "140x140", ")", "-gravity", "NorthWest", "-geometry", "+70+50", "-composite");
    }

    args.push(
      "-font", "DejaVu-Sans-Bold", "-pointsize", "56", "-fill", "#111111", "-gravity", "NorthWest",
      "-annotate", "+250+120", "Recu de paiement",
      "-font", "DejaVu-Sans", "-pointsize", "28", "-fill", "#374151",
      "-annotate", "+74+290", `No recu: ${text.receiptNo}`,
      "-annotate", "+860+290", `Date: ${text.paidAt}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "34", "-fill", "#111111",
      "-annotate", "+74+430", "Informations vendeur",
      "-font", "DejaVu-Sans", "-pointsize", "28", "-fill", "#1F2937",
      "-annotate", "+74+500", `Nom: ${text.vendorName}`,
      "-annotate", "+74+560", `Email: ${text.vendorEmail}`,
      "-annotate", "+74+620", `Telephone: ${text.vendorPhone}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "34", "-fill", "#111111",
      "-annotate", "+74+760", "Informations stand",
      "-font", "DejaVu-Sans", "-pointsize", "28", "-fill", "#1F2937",
      "-annotate", "+74+830", `Code stand: ${text.standCode}`,
      "-annotate", "+74+890", `Zone: ${text.standZone}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "34", "-fill", "#111111",
      "-annotate", "+74+1050", "Detail du paiement",
      "-font", "DejaVu-Sans-Bold", "-pointsize", "40", "-fill", "#EA580C",
      "-annotate", "+74+1135", `Montant paye: ${text.amount}`,
      "-font", "DejaVu-Sans", "-pointsize", "28", "-fill", "#1F2937",
      "-annotate", "+74+1195", `Periode: ${text.period}`,

      "-font", "DejaVu-Sans", "-pointsize", "22", "-fill", "#6B7280",
      "-annotate", "+74+1670", "Document genere automatiquement par STALLA.",
      filePath
    );

    execFileSync("convert", args, { stdio: "ignore" });
  } catch {
    const fallbackLines = [
      "STALLA - Recu de paiement",
      `No recu: ${text.receiptNo}`,
      `Date: ${text.paidAt}`,
      `Vendeur: ${text.vendorName}`,
      `Email: ${text.vendorEmail}`,
      `Telephone: ${text.vendorPhone}`,
      `Stand: ${text.standCode} - ${text.standZone}`,
      `Montant paye: ${text.amount}`,
      `Periode: ${text.period}`,
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
