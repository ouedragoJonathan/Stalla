import path from "path";
import fs from "fs";
import { execFileSync } from "child_process";

const receiptsDir = path.join(process.cwd(), "receipts");
const logoPath = resolveFirstExistingPath([
  path.join(process.cwd(), "assets", "logo.png"),
  path.join(process.cwd(), "src", "assets", "logo.png"),
  path.resolve(process.cwd(), "..", "stalla_web", "public", "logo.png"),
]);

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
  const amount = formatAmount(amountRaw);
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
      "-fill", "#FFD3A5", "-draw", "rectangle 0,0 1240,250",
      "-stroke", "#111111", "-strokewidth", "2", "-draw", "line 70,300 1170,300",
      "-stroke", "#111111", "-strokewidth", "2", "-draw", "line 70,620 1170,620",
      "-fill", "#FFD3A5", "-stroke", "#111111", "-strokewidth", "2", "-draw", "roundrectangle 70,760 1170,1130 20,20",
      "-fill", "#FFD3A5", "-stroke", "#111111", "-strokewidth", "2", "-draw", "rectangle 70,1170 1170,1250",
    ];

    if (logoPath && fs.existsSync(logoPath)) {
      args.push("(", logoPath, "-resize", "130x130", ")", "-gravity", "NorthWest", "-geometry", "+70+70", "-composite");
    }

    args.push(
      "-font", "DejaVu-Sans-Bold", "-pointsize", "72", "-fill", "#111111", "-gravity", "NorthWest",
      "-annotate", "+255+124", "PAYMENT",
      "-annotate", "+255+205", "RECEIPT",

      "-font", "DejaVu-Sans", "-pointsize", "30", "-fill", "#111111",
      "-annotate", "+800+140", "Date:",
      "-annotate", "+800+198", "Receipt No:",
      "-font", "DejaVu-Sans-Bold", "-pointsize", "24", "-fill", "#111111",
      "-annotate", "+975+126", `${text.paidAt}`,
      "-annotate", "+975+184", `${text.receiptNo}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "50", "-fill", "#111111",
      "-annotate", "+70+385", "Received From:",
      "-font", "DejaVu-Sans", "-pointsize", "33", "-fill", "#111111",
      "-annotate", "+70+450", `Name: ${text.vendorName}`,
      "-annotate", "+70+503", `Phone: ${text.vendorPhone}`,
      "-annotate", "+70+556", `Email: ${text.vendorEmail}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "50", "-fill", "#111111",
      "-annotate", "+690+385", "Payment For:",
      "-font", "DejaVu-Sans", "-pointsize", "33", "-fill", "#111111",
      "-annotate", "+690+450", `Stand ${text.standCode} (Zone ${text.standZone})`,
      "-annotate", "+690+503", `Period: ${text.period}`,
      "-annotate", "+690+556", `Amount Paid: ${text.amount}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "40", "-fill", "#111111",
      "-annotate", "+95+840", "Payment Summary",
      "-font", "DejaVu-Sans", "-pointsize", "33", "-fill", "#111111",
      "-annotate", "+95+905", "Description: Stand rent payment",
      "-annotate", "+95+965", "Quantity: 1",
      "-annotate", "+95+1025", `Period: ${text.period}`,
      "-annotate", "+95+1085", `Vendor: ${text.vendorName}`,
      "-annotate", "+700+965", `Unit Price: ${text.amount}`,
      "-annotate", "+700+1025", `Total: ${text.amount}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "42", "-fill", "#111111",
      "-annotate", "+95+1232", `Total Amount Paid: ${text.amount}`,

      "-font", "DejaVu-Sans-Bold", "-pointsize", "44", "-fill", "#111111",
      "-annotate", "+70+1410", "Issued By:",
      "-font", "DejaVu-Sans", "-pointsize", "30", "-fill", "#111111",
      "-annotate", "+70+1460", "STALLA",
      "-annotate", "+70+1505", "Market Management Platform",
      "-font", "DejaVu-Sans", "-pointsize", "26", "-fill", "#111111",
      "-annotate", "+760+1450", "Thank You for Your Business!",
      "-annotate", "+760+1498", "This receipt is system-generated.",
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

function formatAmount(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return sanitizeText(value);
  const normalized = num.toLocaleString("fr-FR").replace(/\s+/g, " ");
  return `${normalized} CFA`;
}

function resolveFirstExistingPath(paths) {
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
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
