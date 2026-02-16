import path from "path";
import fs from "fs";

const receiptsDir = path.join(process.cwd(), "receipts");

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

  const lines = [
    { text: "STALLA", x: 52, y: 804, size: 12, bold: true },
    { text: "Recu de paiement", x: 52, y: 778, size: 24, bold: true },
    { text: `No recu: #${payment.id}`, x: 52, y: 748, size: 11, bold: false },
    { text: `Date: ${paidAt}`, x: 420, y: 748, size: 11, bold: false },

    { text: "Informations vendeur", x: 52, y: 704, size: 12, bold: true },
    { text: `Nom: ${vendor.full_name || "-"}`, x: 52, y: 684, size: 11, bold: false },
    { text: `Email: ${vendor.email || "-"}`, x: 52, y: 668, size: 11, bold: false },
    { text: `Telephone: ${vendor.phone || "-"}`, x: 52, y: 652, size: 11, bold: false },

    { text: "Informations stand", x: 52, y: 618, size: 12, bold: true },
    { text: `Code stand: ${stand.code || "-"}`, x: 52, y: 598, size: 11, bold: false },
    { text: `Zone: ${stand.zone || "-"}`, x: 52, y: 582, size: 11, bold: false },

    { text: "Detail du paiement", x: 52, y: 548, size: 12, bold: true },
    { text: `Montant paye: ${amount}`, x: 52, y: 528, size: 12, bold: true },
    { text: `Periode: ${period}`, x: 52, y: 512, size: 11, bold: false },

    { text: "Document genere automatiquement par STALLA.", x: 52, y: 84, size: 9, bold: false },
  ];

  const pdfBuffer = createSimplePdf(lines);
  fs.writeFileSync(filePath, pdfBuffer);
  return { filePath: `/receipts/${filename}` };
}

function escapePdfText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function createSimplePdf(lines) {
  const streamParts = [
    "0.98 0.95 0.86 rg",
    "40 764 515 56 re f",
    "0.95 0.95 0.95 rg",
    "40 538 515 1 re f",
    "0 0 0 rg",
  ];

  for (const line of lines) {
    const font = line.bold ? "/F2" : "/F1";
    const text = escapePdfText(line.text);
    streamParts.push("BT");
    streamParts.push(`${font} ${line.size} Tf`);
    streamParts.push(`1 0 0 1 ${line.x} ${line.y} Tm`);
    streamParts.push(`(${text}) Tj`);
    streamParts.push("ET");
  }

  const stream = `${streamParts.join("\n")}\n`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
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

  objects.forEach((obj, index) => {
    offsets.push(cursor);
    push(`${index + 1} 0 obj\n${obj}\nendobj\n`);
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
