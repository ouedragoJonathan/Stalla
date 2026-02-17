import jwt from "jsonwebtoken";
import { User, Vendor, VendorApplication } from "../database.js";
import { config } from "../config.js";
import { sendResponse } from "../utils/response.js";
import { sendAdminResetEmail } from "../services/emailService.js";

function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

async function findUserForLogin(identifier) {
  if (identifier.includes("@")) {
    return User.findOne({
      where: { email: identifier },
      include: [{ model: Vendor, as: "vendorProfile", required: false }],
    });
  }

  const byEmail = await User.findOne({
    where: { email: identifier },
    include: [{ model: Vendor, as: "vendorProfile", required: false }],
  });
  if (byEmail) return byEmail;

  return User.findOne({
    where: { role: "VENDOR" },
    include: [{ model: Vendor, as: "vendorProfile", where: { phone: identifier }, required: true }],
  });
}

export async function registerAdmin(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: { fields: "name, email, password requis" },
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Email déjà utilisé",
        errors: { email: "Un compte existe déjà avec cet email" },
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "ADMIN",
    });

    const token = createToken(admin);
    return sendResponse(res, {
      status: 201,
      message: "Compte administrateur créé avec succès",
      data: {
        token,
        user: { id: admin.id, role: admin.role, name: admin.name },
      },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur serveur lors de la création du compte admin",
      errors: { server: err.message },
    });
  }
}

export async function login(req, res) {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginIdentifier = (identifier || email || phone || "").trim();

    if (!loginIdentifier || !password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Identifiant et mot de passe requis",
        errors: { fields: "identifier (ou email/phone) et password sont obligatoires" },
      });
    }

    const user = await findUserForLogin(loginIdentifier);

    if (!user) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Identifiants invalides",
        errors: { credentials: "Email ou mot de passe incorrect" },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Identifiants invalides",
        errors: { credentials: "Email ou mot de passe incorrect" },
      });
    }

    const token = createToken(user);
    const name = user.role === "VENDOR" && user.vendorProfile ? user.vendorProfile.fullName : user.name;

    return sendResponse(res, {
      status: 200,
      message: "Connexion réussie",
      data: {
        token,
        user: {
          id: user.id,
          role: user.role,
          name,
          email: user.email || null,
          phone: user.vendorProfile?.phone || null,
        },
      },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur serveur lors de la connexion",
      errors: { server: err.message },
    });
  }
}

export async function forgotAdminPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Email requis",
        errors: { email: "email obligatoire" },
      });
    }

    const admin = await User.findOne({ where: { email, role: "ADMIN" } });
    if (!admin) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Aucun compte administrateur trouvé pour cet email.",
        errors: { email: "admin introuvable" },
      });
    }

    const token = jwt.sign(
      { id: admin.id, role: "ADMIN", purpose: "admin_reset_password" },
      config.jwtSecret,
      { expiresIn: "30m" },
    );
    const webBaseUrl = process.env.WEB_BASE_URL || "http://localhost:5173";
    const resetUrl = `${webBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const sendResult = await sendAdminResetEmail({
      to: admin.email,
      adminName: admin.name,
      resetUrl,
    });

    if (!sendResult.ok) {
      const message = process.env.NODE_ENV === "production"
        ? "Impossible d'envoyer l'email de réinitialisation"
        : `Impossible d'envoyer l'email. Lien direct: ${resetUrl}`;
      return sendResponse(res, {
        status: 500,
        success: false,
        message,
        errors: { email: sendResult.reason || "Erreur d'envoi email" },
      });
    }

    return sendResponse(res, {
      status: 200,
      message: "Lien de réinitialisation envoyé par email.",
      data: null,
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur serveur lors de la demande de réinitialisation",
      errors: { server: err.message },
    });
  }
}

export async function resetAdminPassword(req, res) {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "token et new_password requis",
        errors: { fields: "token et new_password sont obligatoires" },
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Lien de réinitialisation invalide ou expiré",
        errors: { token: "token invalide/expiré" },
      });
    }

    if (
      !payload ||
      payload.role !== "ADMIN" ||
      payload.purpose !== "admin_reset_password" ||
      !payload.id
    ) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Token invalide",
        errors: { token: "token invalide" },
      });
    }

    const admin = await User.findOne({ where: { id: payload.id, role: "ADMIN" } });
    if (!admin) {
      return sendResponse(res, {
        status: 404,
        success: false,
        message: "Compte admin introuvable",
        errors: { user: "admin non trouvé" },
      });
    }

    admin.password = new_password;
    await admin.save();

    return sendResponse(res, {
      status: 200,
      message: "Mot de passe réinitialisé avec succès",
      data: null,
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur serveur lors de la réinitialisation",
      errors: { server: err.message },
    });
  }
}

export async function submitVendorApplication(req, res) {
  try {
    const { full_name, phone, email, desired_zone, budget_min, budget_max } = req.body;

    if (!full_name || !phone || !desired_zone || budget_min == null || budget_max == null) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Champs obligatoires manquants",
        errors: {
          fields: "full_name, phone, desired_zone, budget_min, budget_max requis (email optionnel)",
        },
      });
    }

    const min = Number(budget_min);
    const max = Number(budget_max);
    if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || min > max) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Marge de prix invalide",
        errors: { budget: "budget_min et budget_max doivent être valides, > 0 et min <= max" },
      });
    }

    const existingPhone = await Vendor.findOne({ where: { phone } });
    if (existingPhone) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Ce numéro est déjà enregistré",
        errors: { phone: "Un vendeur actif existe déjà avec ce numéro" },
      });
    }

    const existingPending = await VendorApplication.findOne({ where: { phone, status: "PENDING" } });
    if (existingPending) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Une demande est déjà en attente pour ce numéro",
        errors: { phone: "Demande déjà soumise" },
      });
    }

    const application = await VendorApplication.create({
      fullName: full_name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      desiredZone: desired_zone.trim(),
      budgetMin: min,
      budgetMax: max,
      status: "PENDING",
    });

    return sendResponse(res, {
      status: 201,
      message: "Demande envoyée avec succès. Un admin la traitera bientôt.",
      data: {
        id: application.id,
        status: application.status,
      },
    });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors de l'envoi de la demande vendeur",
      errors: { server: err.message },
    });
  }
}
