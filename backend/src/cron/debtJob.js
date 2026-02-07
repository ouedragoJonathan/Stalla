import { Stand, User, Debt } from "../database.js";

/**
 * Crée les dettes mensuelles pour les stands occupés (à appeler périodiquement, ex. 1er du mois).
 * Pour ce projet, on ne lance pas de cron automatique ; à appeler manuellement ou via un scheduler externe.
 */
export async function runDebtJob() {
  const stands = await Stand.findAll({ where: { status: "occupied" } });
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  for (const stand of stands) {
    if (!stand.currentVendorId) continue;
    const existing = await Debt.findOne({
      where: { vendorId: stand.currentVendorId, standId: stand.id, month },
    });
    if (!existing) {
      await Debt.create({
        vendorId: stand.currentVendorId,
        standId: stand.id,
        month,
        amount: stand.monthlyRent,
        isPaid: false,
      });
    }
  }
}

export function startDebtCronJob() {
  // Optionnel : setInterval(() => runDebtJob().catch(console.error), 24 * 60 * 60 * 1000);
  // Pour l'instant on n'exécute pas automatiquement.
}
