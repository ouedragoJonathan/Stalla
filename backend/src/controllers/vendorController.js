import { Op } from "sequelize";
import { Vendor, Allocation, Stand, Payment, User } from "../database.js";
import { sendResponse } from "../utils/response.js";
import { computeDebtForAllocation } from "../utils/debt.js";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysRemaining(endDate) {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date(todayIso());
  const diff = end.getTime() - now.getTime();
  return diff < 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function getVendorByUserId(userId) {
  return Vendor.findOne({ where: { userId } });
}

export async function myStall(req, res) {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Profil vendeur introuvable",
        errors: { vendor: "Aucun profil vendeur lié à cet utilisateur" },
      });
    }

    const today = todayIso();
    const allocation = await Allocation.findOne({
      where: {
        vendorId: vendor.id,
        startDate: { [Op.lte]: today },
        [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }],
      },
      include: [{ model: Stand, as: "stall" }],
      order: [["startDate", "DESC"]],
    });

    if (!allocation || !allocation.stall) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Aucun stand actif",
        errors: { stall: "Aucune attribution active trouvée" },
      });
    }

    return sendResponse(res, {
      status: 200,
      message: "Stand du vendeur",
      data: {
        stall_code: allocation.stall.code,
        zone: allocation.stall.zone,
        monthly_price: Number(allocation.stall.monthlyPrice),
        end_date: allocation.endDate,
        days_remaining: daysRemaining(allocation.endDate),
      },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération du stand",
      errors: { server: err.message },
    });
  }
}

export async function myPayments(req, res) {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Profil vendeur introuvable",
        errors: { vendor: "Aucun profil vendeur lié à cet utilisateur" },
      });
    }

    const allocations = await Allocation.findAll({ where: { vendorId: vendor.id } });
    const allocationIds = allocations.map((a) => a.id);

    if (allocationIds.length === 0) {
      return sendResponse(res, { status: 200, message: "Historique des paiements", data: [] });
    }

    const payments = await Payment.findAll({
      where: { allocationId: allocationIds },
      include: [
        {
          model: Allocation,
          as: "allocation",
          include: [{ model: Stand, as: "stall", attributes: ["code", "zone", "monthlyPrice"] }],
        },
      ],
      order: [["paymentDate", "DESC"]],
    });

    const data = payments.map((payment) => ({
      id: payment.id,
      allocation_id: payment.allocationId,
      amount_paid: Number(payment.amountPaid),
      payment_date: payment.paymentDate,
      period: payment.period,
      stall_code: payment.allocation?.stall?.code || null,
      zone: payment.allocation?.stall?.zone || null,
    }));

    return sendResponse(res, { status: 200, message: "Historique des paiements", data });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération des paiements",
      errors: { server: err.message },
    });
  }
}

export async function myBalance(req, res) {
  try {
    const vendor = await getVendorByUserId(req.user.id);
    if (!vendor) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Profil vendeur introuvable",
        errors: { vendor: "Aucun profil vendeur lié à cet utilisateur" },
      });
    }

    const allocations = await Allocation.findAll({
      where: { vendorId: vendor.id },
      include: [
        { model: Stand, as: "stall", attributes: ["monthlyPrice"] },
        { model: Payment, as: "payments", attributes: ["amountPaid"] },
      ],
    });

    let totalDue = 0;
    let totalPaid = 0;

    for (const allocation of allocations) {
      const paidForAllocation = (allocation.payments || []).reduce(
        (sum, payment) => sum + Number(payment.amountPaid),
        0
      );

      const stats = computeDebtForAllocation({
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        monthlyPrice: allocation.stall?.monthlyPrice || 0,
        totalPaid: paidForAllocation,
      });

      totalDue += stats.total_due;
      totalPaid += stats.total_paid;
    }

    return sendResponse(res, {
      status: 200,
      message: "Situation financière du vendeur",
      data: {
        total_paid: totalPaid,
        total_due: totalDue,
        current_debt: Math.max(totalDue - totalPaid, 0),
      },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors du calcul de la balance",
      errors: { server: err.message },
    });
  }
}

export async function resetMyPassword(req, res) {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "current_password et new_password requis" },
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user || user.role !== "VENDOR") {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Utilisateur vendeur introuvable",
        errors: { user: "Aucun vendeur trouvé pour ce token" },
      });
    }

    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Mot de passe actuel incorrect",
        errors: { current_password: "Le mot de passe actuel est invalide" },
      });
    }

    if (current_password === new_password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Nouveau mot de passe invalide",
        errors: { new_password: "Le nouveau mot de passe doit être différent de l'ancien" },
      });
    }

    user.password = new_password;
    await user.save();

    return sendResponse(res, {
      status: 200,
      message: "Mot de passe réinitialisé avec succès",
      data: null,
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe",
      errors: { server: err.message },
    });
  }
}
