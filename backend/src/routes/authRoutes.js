import express from "express";
import {
  forgotAdminPassword,
  login,
  registerAdmin,
  resetAdminPassword,
  submitVendorApplication,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/register-admin:
 *   post:
 *     tags: [Auth]
 *     summary: Créer un compte administrateur (Web)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Compte admin créé
 *       400:
 *         description: Données invalides
 */
router.post("/register-admin", registerAdmin);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion (ADMIN ou VENDOR)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               identifier: { type: string, description: "email ou téléphone" }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Champs manquants
 *       401:
 *         description: Identifiants invalides
 */
router.post("/login", login);
router.post("/vendor-application", submitVendorApplication);
router.post("/forgot-password", forgotAdminPassword);
router.post("/reset-password", resetAdminPassword);

export default router;
