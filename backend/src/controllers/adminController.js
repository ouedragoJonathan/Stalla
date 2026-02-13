import crypto from "crypto";
import { Op } from "sequelize";
import { sequelize, User, Vendor, Stand, Allocation, Payment, Setting } from "../database.js";
import { sendResponse } from "../utils/response.js";
import { computeDebtForAllocation } from "../utils/debt.js";
import { sendVendorWelcomeSms } from "../services/smsService.js";

const periodRegex = /^\d{4}-\d{2}$/;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function getActiveAllocationByStallId() {
  const today = todayIso();
  const activeAllocations = await Allocation.findAll({
    where: {
      startDate: { [Op.lte]: today },
      [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }],
    },
    include: [
      {
        model: Vendor,
        as: "vendor",
        include: [{ model: User, as: "user", attributes: ["id", "email"] }],
      },
    ],
  });

  return new Map(activeAllocations.map((allocation) => [allocation.stallId, allocation]));
}

export async function listAdminStalls(req, res) {
  try {
    const stands = await Stand.findAll({ order: [["code", "ASC"]] });
    const activeByStall = await getActiveAllocationByStallId();

    const data = stands.map((stand) => {
      const active = activeByStall.get(stand.id);
      return {
        id: stand.id,
        code: stand.code,
        zone: stand.zone,
        monthly_price: Number(stand.monthlyPrice),
        status: stand.status,
        active_allocation: active
          ? {
              id: active.id,
              vendor_id: active.vendorId,
              vendor_name: active.vendor?.fullName || null,
              start_date: active.startDate,
              end_date: active.endDate,
            }
          : null,
      };
    });

    return sendResponse(res, { status: 200, message: "Liste des stands", data });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération des stands",
      errors: { server: err.message },
    });
  }
}

export async function createAdminStand(req, res) {
  try {
    const { code, zone, monthly_price } = req.body;
    if (!code || !zone || monthly_price == null) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "code, zone, monthly_price requis" },
      });
    }

    const existing = await Stand.findOne({ where: { code } });
    if (existing) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Code de stand déjà utilisé",
        errors: { code: "Ce code est déjà pris" },
      });
    }

    const stand = await Stand.create({
      code,
      zone,
      monthlyPrice: Number(monthly_price),
      status: "AVAILABLE",
    });

    return sendResponse(res, {
      status: 201,
      message: "Stand créé avec succès",
      data: {
        id: stand.id,
        code: stand.code,
        zone: stand.zone,
        monthly_price: Number(stand.monthlyPrice),
        status: stand.status,
      },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la création du stand",
      errors: { server: err.message },
    });
  }
}

export async function listAdminVendors(req, res) {
  try {
    const vendors = await Vendor.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "email", "role"] }],
      order: [["id", "DESC"]],
    });

    const data = vendors.map((vendor) => ({
      id: vendor.id,
      user_id: vendor.userId,
      email: vendor.user?.email || null,
      full_name: vendor.fullName,
      phone: vendor.phone,
      business_type: vendor.businessType,
    }));

    return sendResponse(res, { status: 200, message: "Liste des vendeurs", data });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération des vendeurs",
      errors: { server: err.message },
    });
  }
}

export async function createAdminVendor(req, res) {
  const tx = await sequelize.transaction();
  try {
    const { email, full_name, phone, business_type } = req.body;
    if (!full_name || !phone || !business_type) {
      await tx.rollback();
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "full_name, phone, business_type requis (email optionnel)" },
      });
    }

    if (email) {
      const existingUser = await User.findOne({ where: { email }, transaction: tx });
      if (existingUser) {
        await tx.rollback();
        return sendResponse(res, {
          status: 400,
          success: false,
          message: "Email déjà utilisé",
          errors: { email: "Un compte existe déjà avec cet email" },
        });
      }
    }

    const existingPhone = await Vendor.findOne({ where: { phone }, transaction: tx });
    if (existingPhone) {
      await tx.rollback();
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Numéro de téléphone déjà utilisé",
        errors: { phone: "Un vendeur existe déjà avec ce numéro" },
      });
    }

    const generatedPassword = crypto.randomBytes(6).toString("base64url");

    const user = await User.create(
      {
        name: full_name,
        email: email || null,
        password: generatedPassword,
        role: "VENDOR",
      },
      { transaction: tx }
    );

    const vendor = await Vendor.create(
      {
        userId: user.id,
        fullName: full_name,
        phone,
        businessType: business_type,
      },
      { transaction: tx }
    );

    await tx.commit();

    let smsStatus = null;
    try {
      const sms = await sendVendorWelcomeSms({
        to: phone,
        fullName: vendor.fullName,
        password: generatedPassword,
      });
      smsStatus = sms;
    } catch (smsErr) {
      smsStatus = { ok: false, reason: smsErr.message };
    }

    return sendResponse(res, {
      status: 201,
      message: "Vendeur créé avec succès",
      data: {
        id: vendor.id,
        user_id: user.id,
        email: user.email,
        full_name: vendor.fullName,
        phone: vendor.phone,
        business_type: vendor.businessType,
        default_password: generatedPassword,
        sms: smsStatus,
      },
    });
  } catch (err) {
    await tx.rollback();
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la création du vendeur",
      errors: { server: err.message },
    });
  }
}

export async function createAllocation(req, res) {
  try {
    const { vendor_id, stall_id, start_date } = req.body;
    if (!vendor_id || !stall_id || !start_date) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "vendor_id, stall_id, start_date requis" },
      });
    }

    const vendor = await Vendor.findByPk(vendor_id);
    if (!vendor) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Vendeur introuvable",
        errors: { vendor: "Aucun vendeur avec cet id" },
      });
    }

    const stall = await Stand.findByPk(stall_id);
    if (!stall) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Stand introuvable",
        errors: { stall: "Aucun stand avec cet id" },
      });
    }

    const overlapping = await Allocation.findOne({
      where: {
        stallId: stall.id,
        [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: start_date } }],
      },
    });

    if (overlapping) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Ce stand est déjà attribué",
        errors: { allocation: "Une allocation active existe déjà pour ce stand" },
      });
    }

    const allocation = await Allocation.create({
      vendorId: vendor.id,
      stallId: stall.id,
      startDate: start_date,
      endDate: null,
    });

    await stall.update({ status: "OCCUPIED" });

    return sendResponse(res, {
      status: 201,
      message: "Attribution créée avec succès",
      data: {
        id: allocation.id,
        vendor_id: allocation.vendorId,
        stall_id: allocation.stallId,
        start_date: allocation.startDate,
        end_date: allocation.endDate,
      },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la création de l'attribution",
      errors: { server: err.message },
    });
  }
}

export async function createAdminPayment(req, res) {
  try {
    const { allocation_id, amount_paid, period } = req.body;

    if (!allocation_id || amount_paid == null || !period) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "allocation_id, amount_paid, period requis" },
      });
    }

    if (!periodRegex.test(period)) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Format de période invalide",
        errors: { period: "Utilisez le format YYYY-MM" },
      });
    }

    const allocation = await Allocation.findByPk(allocation_id);
    if (!allocation) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Attribution introuvable",
        errors: { allocation: "Aucune attribution avec cet id" },
      });
    }

    const payment = await Payment.create({
      allocationId: allocation.id,
      amountPaid: Number(amount_paid),
      paymentDate: new Date().toISOString().slice(0, 10),
      period,
    });

    return sendResponse(res, {
      status: 201,
      message: "Paiement enregistré avec succès",
      data: {
        id: payment.id,
        allocation_id: payment.allocationId,
        amount_paid: Number(payment.amountPaid),
        payment_date: payment.paymentDate,
        period: payment.period,
      },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de l'enregistrement du paiement",
      errors: { server: err.message },
    });
  }
}

export async function reportDebtors(req, res) {
  try {
    const vendors = await Vendor.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "email"] },
        {
          model: Allocation,
          as: "allocations",
          include: [
            { model: Stand, as: "stall", attributes: ["id", "code", "zone", "monthlyPrice"] },
            { model: Payment, as: "payments", attributes: ["id", "amountPaid", "period", "paymentDate"] },
          ],
        },
      ],
    });

    const debtors = vendors
      .map((vendor) => {
        let totalDue = 0;
        let totalPaid = 0;

        for (const allocation of vendor.allocations || []) {
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

        const currentDebt = Math.max(totalDue - totalPaid, 0);

        return {
          vendor_id: vendor.id,
          email: vendor.user?.email || null,
          full_name: vendor.fullName,
          phone: vendor.phone,
          business_type: vendor.businessType,
          total_paid: totalPaid,
          total_due: totalDue,
          current_debt: currentDebt,
        };
      })
      .filter((item) => item.current_debt > 0)
      .sort((a, b) => b.current_debt - a.current_debt);

    return sendResponse(res, {
      status: 200,
      message: "Liste des vendeurs débiteurs",
      data: debtors,
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la génération du rapport des débiteurs",
      errors: { server: err.message },
    });
  }
}

export async function getSupportSettings(req, res) {
  try {
    const setting = await Setting.findByPk("support_phone");
    return sendResponse(res, {
      status: 200,
      message: "Paramètres support",
      data: { support_phone: setting?.value || null },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération des paramètres",
      errors: { server: err.message },
    });
  }
}

export async function updateSupportSettings(req, res) {
  try {
    const { support_phone } = req.body;
    if (!support_phone) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "support_phone est requis",
        errors: { support_phone: "support_phone obligatoire" },
      });
    }

    await Setting.upsert({ key: "support_phone", value: support_phone });

    return sendResponse(res, {
      status: 200,
      message: "Paramètres support mis à jour",
      data: { support_phone },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la mise à jour des paramètres",
      errors: { server: err.message },
    });
  }
}
