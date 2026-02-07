import express from "express";
import { createPayment, listPayments } from "../controllers/paymentController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Enregistrer un paiement (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vendorId, standId, amount, monthPaid, method]
 *             properties:
 *               vendorId: { type: integer }
 *               standId: { type: integer }
 *               amount: { type: number }
 *               monthPaid: { type: string, description: "Mois payé (ex. 2025-01)" }
 *               method: { type: string, description: "Méthode de paiement" }
 *     responses:
 *       201: { description: Paiement enregistré }
 *       400: { description: Champs manquants }
 *       404: { description: Vendeur ou stand introuvable }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.post("/", authenticate, authorize("ADMIN"), createPayment);

/**
 * @openapi
 * /api/v1/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Liste des paiements (ADMIN = tous, VENDOR = les siens)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des paiements }
 *       401: { description: Non authentifié }
 */
router.get("/", authenticate, authorize("ADMIN", "VENDOR"), listPayments);

export default router;
