import { Op } from "sequelize";
import { Stand, User } from "../database.js";
import { sendResponse } from "../utils/response.js";

export const listStands = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && ["free", "occupied"].includes(status)) where.status = status;
    const stands = await Stand.findAll({
      where,
      include: [{ model: User, as: "User", attributes: ["id", "name", "email"], required: false }],
    });
    const data = stands.map((s) => {
      const stand = s.toJSON();
      stand.currentVendor = stand.User || null;
      delete stand.User;
      return stand;
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
};

export const getStandById = async (req, res) => {
  try {
    const { id } = req.params;
    const stand = await Stand.findByPk(id, {
      include: [{ model: User, as: "User", attributes: ["id", "name", "email"], required: false }],
    });
    if (!stand) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Stand introuvable",
        errors: { stand: "Aucun stand avec cet id" },
      });
    }
    const data = stand.toJSON();
    data.currentVendor = data.User || null;
    delete data.User;
    return sendResponse(res, { status: 200, message: "Stand récupéré avec succès", data });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération du stand",
      errors: { server: err.message },
    });
  }
};

export const createStand = async (req, res) => {
  try {
    const { code, zone, surface, monthlyRent } = req.body;
    if (!code || !zone || surface == null || monthlyRent == null) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "code, zone, surface, monthlyRent requis" },
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
      surface: Number(surface),
      monthlyRent: Number(monthlyRent),
    });
    return sendResponse(res, { status: 201, message: "Stand créé avec succès", data: stand.toJSON() });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la création du stand",
      errors: { server: err.message },
    });
  }
};

export const updateStand = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, zone, surface, monthlyRent } = req.body;
    const stand = await Stand.findByPk(id);
    if (!stand) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Stand introuvable",
        errors: { stand: "Aucun stand avec cet id" },
      });
    }
    if (code != null && code !== stand.code) {
      const existing = await Stand.findOne({ where: { code, id: { [Op.ne]: id } } });
      if (existing) {
        return sendResponse(res, {
          status: 400,
          success: false,
          message: "Code de stand déjà utilisé",
          errors: { code: "Ce code est déjà pris par un autre stand" },
        });
      }
    }
    if (code !== undefined) stand.code = code;
    if (zone !== undefined) stand.zone = zone;
    if (surface !== undefined) stand.surface = Number(surface);
    if (monthlyRent !== undefined) stand.monthlyRent = Number(monthlyRent);
    await stand.save();
    return sendResponse(res, { status: 200, message: "Stand modifié avec succès", data: stand.toJSON() });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la modification du stand",
      errors: { server: err.message },
    });
  }
};

export const deleteStand = async (req, res) => {
  try {
    const { id } = req.params;
    const stand = await Stand.findByPk(id);
    if (!stand) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Stand introuvable",
        errors: { stand: "Aucun stand avec cet id" },
      });
    }
    if (stand.status === "occupied") {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Impossible de supprimer un stand occupé",
        errors: { stand: "Libérez d'abord le stand avant de le supprimer" },
      });
    }
    await stand.destroy();
    return sendResponse(res, { status: 200, message: "Stand supprimé avec succès", data: null });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la suppression du stand",
      errors: { server: err.message },
    });
  }
};

export const assignStand = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorId } = req.body;
    if (!vendorId) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "vendorId est requis",
        errors: { vendorId: "vendorId est obligatoire" },
      });
    }
    const stand = await Stand.findByPk(id);
    if (!stand) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Stand introuvable",
        errors: { stand: "Aucun stand avec cet id" },
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
    stand.currentVendorId = vendor.id;
    stand.status = "occupied";
    await stand.save();
    const updated = await Stand.findByPk(id, {
      include: [{ model: User, as: "User", attributes: ["id", "name", "email"], required: false }],
    });
    const data = updated.toJSON();
    data.currentVendor = data.User || null;
    delete data.User;
    return sendResponse(res, { status: 200, message: "Stand assigné au vendeur", data });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de l'assignation du stand",
      errors: { server: err.message },
    });
  }
};
