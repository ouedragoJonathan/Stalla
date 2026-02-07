import jwt from "jsonwebtoken";
import { User } from "../database.js";
import { config } from "../config.js";
import { sendResponse } from "../utils/response.js";

/**
 * Vérifie le token JWT et attache req.user (id, role).
 * Renvoie 401 si token absent, invalide ou expiré.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(res, {
      status: 401,
      success: false,
      message: "Token manquant ou invalide",
      errors: { auth: "Header Authorization: Bearer <token> requis" },
    });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Utilisateur introuvable",
        errors: { auth: "Token invalide" },
      });
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    return sendResponse(res, {
      status: 401,
      success: false,
      message: "Token invalide ou expiré",
      errors: { auth: err.message || "Token invalide" },
    });
  }
}

/**
 * Vérifie que req.user.role est l'un des rôles autorisés.
 * À utiliser après authenticate().
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Non authentifié",
        errors: { auth: "Authentification requise" },
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return sendResponse(res, {
        status: 403,
        success: false,
        message: "Accès refusé",
        errors: { permission: "Droits insuffisants pour cette action" },
      });
    }
    next();
  };
}
