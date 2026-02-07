import express from "express";
import { adminLogin, vendorLogin } from "../controllers/authController.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/auth/admin/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion administrateur
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Connexion réussie, retourne token et user }
 *       400: { description: Email ou mot de passe manquant }
 *       401: { description: Identifiants invalides }
 */
router.post("/admin/login", adminLogin);

/**
 * @openapi
 * /api/v1/auth/vendor/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion vendeur
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Connexion réussie, retourne token et user }
 *       400: { description: Email ou mot de passe manquant }
 *       401: { description: Identifiants invalides }
 */
router.post("/vendor/login", vendorLogin);

export default router;
