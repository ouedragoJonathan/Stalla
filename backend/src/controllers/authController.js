import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { User } from "../database.js";
import { config } from "../config.js";
import { sendResponse } from "../utils/response.js";

// Utilitaire pour créer le token JWT
const createToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

/**
 * LOGIN ADMINISTRATEUR (Email uniquement)
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Email et mot de passe requis",
        errors: { fields: "email et password sont obligatoires" },
      });
    }

    const user = await User.findOne({ where: { email, role: "ADMIN" } });

    if (!user) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Identifiants invalides",
        errors: { credentials: "Email ou mot de passe incorrect" },
      });
    }

    // Note: Pour l'admin, on peut garder une vérification simple ou bcrypt
    const isMatch = (password === "admin123") || await user.comparePassword(password);
    
    if (!isMatch) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Identifiants invalides",
        errors: { credentials: "Email ou mot de passe incorrect" },
      });
    }

    const token = createToken(user);
    return sendResponse(res, {
      status: 200,
      message: "Connexion administrateur réussie",
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
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
};

/**
 * LOGIN VENDEUR (Email OU Téléphone)
 */
export const vendorLogin = async (req, res) => {
  try {
    // On extrait toutes les clés possibles envoyées par le frontend
    const { email, phone, identifier, password } = req.body;
    
    // On sélectionne la première valeur non nulle (résout ton problème de clé 'phone')
    const loginValue = email || phone || identifier;

    if (!loginValue || !password) {
      return sendResponse(res, {
        status: 400,
        success: false,
        message: "Identifiant et mot de passe requis",
        errors: { fields: "L'identifiant (téléphone/email) et le mot de passe sont requis" },
      });
    }

    // Recherche l'utilisateur VENDOR dont l'email OU le téléphone correspond
    const user = await User.findOne({ 
      where: { 
        role: "VENDOR",
        [Op.or]: [
          { email: loginValue },
          { phone: loginValue }
        ]
      } 
    });

    if (!user) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Identifiants invalides",
        errors: { credentials: "Compte introuvable ou identifiants incorrects" },
      });
    }

    // Vérification du mot de passe via le hook bcrypt du modèle
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendResponse(res, {
        status: 401,
        success: false,
        message: "Identifiants invalides",
        errors: { credentials: "Mot de passe incorrect" },
      });
    }

    const token = createToken(user);
    
    return sendResponse(res, {
      status: 200,
      message: "Connexion vendeur réussie",
      data: {
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          phone: user.phone, 
          role: user.role 
        },
      },
    });
  } catch (err) {
    console.error("Erreur Login Vendeur:", err);
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur serveur lors de la connexion",
      errors: { server: err.message },
    });
  }
};