import express from "express";
import { listStands, createStand, assignStand, getStandById, updateStand, deleteStand } from "../controllers/standController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/stands:
 *   get:
 *     tags: [Stands]
 *     summary: Liste des stands
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [free, occupied] }
 *         description: Filtrer par statut
 *     responses:
 *       200: { description: Liste des stands }
 *       401: { description: Non authentifié }
 */
router.get("/", authenticate, listStands);

/**
 * @openapi
 * /api/v1/stands/{id}:
 *   get:
 *     tags: [Stands]
 *     summary: Détail d'un stand
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Stand récupéré }
 *       404: { description: Stand introuvable }
 *       401: { description: Non authentifié }
 */
router.get("/:id", authenticate, getStandById);

/**
 * @openapi
 * /api/v1/stands:
 *   post:
 *     tags: [Stands]
 *     summary: Créer un stand (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, zone, surface, monthlyRent]
 *             properties:
 *               code: { type: string }
 *               zone: { type: string }
 *               surface: { type: number }
 *               monthlyRent: { type: number }
 *     responses:
 *       201: { description: Stand créé }
 *       400: { description: Champs manquants ou code déjà utilisé }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.post("/", authenticate, authorize("ADMIN"), createStand);

/**
 * @openapi
 * /api/v1/stands/{id}:
 *   put:
 *     tags: [Stands]
 *     summary: Modifier un stand (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string }
 *               zone: { type: string }
 *               surface: { type: number }
 *               monthlyRent: { type: number }
 *     responses:
 *       200: { description: Stand mis à jour }
 *       404: { description: Stand introuvable }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.put("/:id", authenticate, authorize("ADMIN"), updateStand);

/**
 * @openapi
 * /api/v1/stands/{id}:
 *   delete:
 *     tags: [Stands]
 *     summary: Supprimer un stand (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Stand supprimé }
 *       404: { description: Stand introuvable }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.delete("/:id", authenticate, authorize("ADMIN"), deleteStand);

/**
 * @openapi
 * /api/v1/stands/{id}/assign:
 *   post:
 *     tags: [Stands]
 *     summary: Assigner un vendeur à un stand (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vendorId]
 *             properties:
 *               vendorId: { type: integer }
 *     responses:
 *       200: { description: Stand assigné }
 *       400: { description: Données invalides }
 *       404: { description: Stand ou vendeur introuvable }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.post("/:id/assign", authenticate, authorize("ADMIN"), assignStand);

export default router;
