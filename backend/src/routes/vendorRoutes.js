import express from "express";
import { myBalance, myPayments, myProfile, myStall, resetMyPassword } from "../controllers/vendorController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate, authorize("VENDOR"));

/**
 * @openapi
 * /api/vendor/my-stall:
 *   get:
 *     tags: [Vendor]
 *     summary: Détails du stand occupé (VENDOR)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Stand actif du vendeur }
 */
router.get("/my-stall", myStall);

/**
 * @openapi
 * /api/vendor/profile:
 *   get:
 *     tags: [Vendor]
 *     summary: Profil vendeur (VENDOR)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profil vendeur }
 */
router.get("/profile", myProfile);

/**
 * @openapi
 * /api/vendor/payments:
 *   get:
 *     tags: [Vendor]
 *     summary: Historique des paiements du vendeur (VENDOR)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des paiements }
 */
router.get("/payments", myPayments);

/**
 * @openapi
 * /api/vendor/balance:
 *   get:
 *     tags: [Vendor]
 *     summary: Balance financière (VENDOR)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: total_paid, total_due, current_debt }
 */
router.get("/balance", myBalance);

/**
 * @openapi
 * /api/vendor/reset-password:
 *   post:
 *     tags: [Vendor]
 *     summary: Réinitialiser son mot de passe (VENDOR)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password: { type: string }
 *               new_password: { type: string }
 *     responses:
 *       200: { description: Mot de passe modifié }
 *       401: { description: Mot de passe actuel incorrect }
 */
router.post("/reset-password", resetMyPassword);

export default router;
