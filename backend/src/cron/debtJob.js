import { Op } from "sequelize";
import { Allocation, Stand } from "../database.js";

let lastRunMonth = null;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function syncStallStatuses() {
  const today = todayIso();
  const activeAllocations = await Allocation.findAll({
    where: {
      startDate: { [Op.lte]: today },
      [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }],
    },
    attributes: ["stallId"],
  });

  const occupiedIds = [...new Set(activeAllocations.map((a) => a.stallId))];

  await Stand.update({ status: "AVAILABLE" }, { where: {} });
  if (occupiedIds.length > 0) {
    await Stand.update({ status: "OCCUPIED" }, { where: { id: occupiedIds } });
  }
}

export async function runDebtJob() {
  // Le calcul de dette est dynamique (mois occupés * loyer - paiements).
  // Ce job maintient les statuts et s'exécute le 1er de chaque mois.
  await syncStallStatuses();
  return { ranAt: new Date().toISOString() };
}

export function startDebtCronJob() {
  setInterval(async () => {
    const now = new Date();
    const key = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    if (now.getUTCDate() !== 1 || lastRunMonth === key) return;

    try {
      await runDebtJob();
      lastRunMonth = key;
    } catch (err) {
      console.error("Erreur job dettes mensuel:", err.message);
    }
  }, 60 * 60 * 1000);
}
