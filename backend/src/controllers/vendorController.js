import { Op } from "sequelize";
import { User, Stand, Debt } from "../database.js";
import { sendResponse } from "../utils/response.js";

const userAttrs = { attributes: { exclude: ["password"] } };

export const listVendors = async (req, res) => {
  try {
    const vendors = await User.findAll({ where: { role: "VENDOR" }, ...userAttrs });
    return sendResponse(res, { status: 200, message: "Liste des vendeurs", data: vendors.map((v) => v.toJSON()) });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération des vendeurs",
      errors: { server: err.message },
    });
  }
};

export const createVendor = async (req, res) => {
  try {
    // AJOUT DE PHONE ICI
    const { name, phone, password, email } = req.body;

    // LE PHONE DEVIENT OBLIGATOIRE, L'EMAIL EST FACULTATIF
    if (!name || !phone || !password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "name, phone, password requis" },
      });
    }

    // VÉRIFICATION SI LE TÉLÉPHONE EST DÉJÀ UTILISÉ
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Numéro de téléphone déjà utilisé",
        errors: { phone: "Un compte existe déjà avec ce numéro" },
      });
    }

    // SI UN EMAIL EST FOURNI, ON VÉRIFIE SON UNICITÉ
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return sendResponse(res, {
          status: 400,
          success: false,
          message: "Email déjà utilisé",
          errors: { email: "Un compte existe déjà avec cet email" },
        });
      }
    }

    // CRÉATION AVEC PHONE
    const vendor = await User.create({ 
      name, 
      phone, 
      email: email || null, // Email peut être null
      password, 
      role: "VENDOR" 
    });

    return sendResponse(res, {
      status: 201,
      message: "Vendeur créé avec succès",
      data: { id: vendor.id, name: vendor.name, phone: vendor.phone, email: vendor.email, role: vendor.role },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la création du vendeur",
      errors: { server: err.message },
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, userAttrs);
    if (!user) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Utilisateur introuvable",
        errors: { user: "Introuvable" },
      });
    }
    const stand = await Stand.findOne({ where: { currentVendorId: user.id } });
    return sendResponse(res, {
      status: 200,
      message: "Profil du vendeur connecté",
      data: { user: user.toJSON(), stand: stand ? stand.toJSON() : null },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération du profil",
      errors: { server: err.message },
    });
  }
};

export const getMyDebts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const debts = await Debt.findAll({
      where: { vendorId, isPaid: false },
      include: [{ model: Stand, as: "Stand", attributes: ["id", "code", "zone", "monthlyRent"] }],
    });
    const total = debts.reduce((sum, d) => sum + Number(d.amount), 0);
    const data = debts.map((d) => {
      const j = d.toJSON();
      j.stand = j.Stand;
      delete j.Stand;
      return j;
    });
    return sendResponse(res, { status: 200, message: "Dettes du vendeur connecté", data: { total, debts: data } });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération des dettes",
      errors: { server: err.message },
    });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await User.findOne({ where: { id, role: "VENDOR" }, ...userAttrs });
    if (!vendor) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Vendeur introuvable",
        errors: { vendor: "Aucun vendeur avec cet id" },
      });
    }
    const stand = await Stand.findOne({ where: { currentVendorId: vendor.id } });
    return sendResponse(res, {
      status: 200,
      message: "Vendeur récupéré avec succès",
      data: { vendor: vendor.toJSON(), stand: stand ? stand.toJSON() : null },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération du vendeur",
      errors: { server: err.message },
    });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;
    const vendor = await User.findOne({ where: { id, role: "VENDOR" } });
    if (!vendor) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Vendeur introuvable",
        errors: { vendor: "Aucun vendeur avec cet id" },
      });
    }
    // MODIFICATION INTERDITE POUR L'ADMIN SUR CES CHAMPS
    if (name !== undefined || email !== undefined || phone !== undefined || password !== undefined) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Accès refusé",
        errors: {
          permission:
            "L'administrateur ne peut pas modifier les informations personnelles d'un vendeur. Seul le vendeur peut le faire.",
        },
      });
    }
    const updatedVendor = await User.findByPk(vendor.id, userAttrs);
    return sendResponse(res, { status: 200, message: "Vendeur récupéré avec succès", data: updatedVendor.toJSON() });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la récupération du vendeur",
      errors: { server: err.message },
    });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await User.findOne({ where: { id, role: "VENDOR" } });
    if (!vendor) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Vendeur introuvable",
        errors: { vendor: "Aucun vendeur avec cet id" },
      });
    }
    await Stand.update({ currentVendorId: null, status: "free" }, { where: { currentVendorId: vendor.id } });
    await vendor.destroy();
    return sendResponse(res, { status: 200, message: "Vendeur supprimé avec succès", data: null });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la suppression du vendeur",
      errors: { server: err.message },
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const vendorId = req.user.id;
    const vendor = await User.findByPk(vendorId);

    if (!vendor || vendor.role !== "VENDOR") {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Vendeur introuvable",
        errors: { vendor: "Inconnu" },
      });
    }

    // VÉRIFICATION UNICITÉ EMAIL
    if (email && email !== vendor.email) {
      const existing = await User.findOne({ where: { email, id: { [Op.ne]: vendorId } } });
      if (existing) {
        return sendResponse(res, {
          status: 400,
          success: false,
          message: "Email déjà utilisé",
          errors: { email: "Cet email appartient déjà à un autre compte" },
        });
      }
    }

    // VÉRIFICATION UNICITÉ PHONE
    if (phone && phone !== vendor.phone) {
      const existingPhone = await User.findOne({ where: { phone, id: { [Op.ne]: vendorId } } });
      if (existingPhone) {
        return sendResponse(res, {
          status: 400,
          success: false,
          message: "Téléphone déjà utilisé",
          errors: { phone: "Ce numéro appartient déjà à un autre compte" },
        });
      }
    }

    if (name !== undefined) vendor.name = name;
    if (email !== undefined) vendor.email = email;
    if (phone !== undefined) vendor.phone = phone;
    if (password !== undefined) vendor.password = password;

    await vendor.save();
    const updatedVendor = await User.findByPk(vendor.id, userAttrs);
    return sendResponse(res, { status: 200, message: "Profil modifié avec succès", data: updatedVendor.toJSON() });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de la modification du profil",
      errors: { server: err.message },
    });
  }
};