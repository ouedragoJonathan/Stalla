import { Payment, Stand, User } from "../database.js";
import { sendResponse } from "../utils/response.js";
import { generatePaymentReceipt } from "../services/pdfService.js";

export const createPayment = async (req, res) => {
  try {
    const { vendorId, standId, amount, monthPaid, method } = req.body;
    if (!vendorId || !standId || !amount || !monthPaid || !method) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "vendorId, standId, amount, monthPaid, method requis" },
      });
    }
    const vendor = await User.findOne({ where: { id: vendorId, role: "VENDOR" } });
    if (!vendor) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Vendeur introuvable",
        errors: { vendor: "Aucun vendeur avec cet id" },
      });
    }
    const stand = await Stand.findByPk(standId);
    if (!stand) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Stand introuvable",
        errors: { stand: "Aucun stand avec cet id" },
      });
    }
    const payment = await Payment.create({
      vendorId: vendor.id,
      standId: stand.id,
      amount: Number(amount),
      monthPaid,
      method,
    });
    try {
      const { filePath } = await generatePaymentReceipt({
        payment: payment.toJSON(),
        vendor: vendor.toJSON(),
        stand: stand.toJSON(),
      });
      await payment.update({ receiptPath: filePath });
    } catch (pdfErr) {
      // Reçu optionnel : on ne fait pas échouer la requête
    }
    return sendResponse(res, { status: 201, message: "Paiement enregistré avec succès", data: payment.toJSON() });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de l'enregistrement du paiement",
      errors: { server: err.message },
    });
  }
};

export const listPayments = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === "VENDOR") where.vendorId = req.user.id;
    const payments = await Payment.findAll({
      where,
      include: [
        { model: User, as: "User", attributes: ["id", "name", "email"] },
        { model: Stand, as: "Stand", attributes: ["id", "code", "zone"] },
      ],
    });
    const data = payments.map((p) => {
      const j = p.toJSON();
      j.vendor = j.User;
      j.stand = j.Stand;
      delete j.User;
      delete j.Stand;
      return j;
    });
    return sendResponse(res, { status: 200, message: "Historique des paiements", data });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération des paiements",
      errors: { server: err.message },
    });
  }
};
