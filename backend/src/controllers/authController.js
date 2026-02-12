import jwt from "jsonwebtoken";
import { User, Vendor } from "../database.js";
import { config } from "../config.js";
import { sendResponse } from "../utils/response.js";

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
