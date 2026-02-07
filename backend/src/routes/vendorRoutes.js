import express from "express";
import { listVendors, createVendor, getMe, getMyDebts, getVendorById, updateVendor, updateMe, deleteVendor } from "../controllers/vendorController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @openapi
 * /api/v1/vendors:
 *   get:
 *     tags: [Vendors]
 *     summary: Liste des vendeurs (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des vendeurs }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.get("/", authenticate, authorize("ADMIN"), listVendors);

/**
 * @openapi
 * /api/v1/vendors:
 *   post:
 *     tags: [Vendors]
 *     summary: Créer un vendeur (ADMIN)
 *     security: [{ bearerAuth: [] }]
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
 *       201: { description: Vendeur créé }
 *       400: { description: Champs manquants ou email déjà utilisé }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.post("/", authenticate, authorize("ADMIN"), createVendor);

/**
 * @openapi
 * /api/v1/vendors/me:
 *   get:
 *     tags: [Vendors]
 *     summary: Profil du vendeur connecté
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profil et stand assigné }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux vendeurs }
 */
router.get("/me", authenticate, authorize("VENDOR"), getMe);

/**
 * @openapi
 * /api/v1/vendors/me/debts:
 *   get:
 *     tags: [Vendors]
 *     summary: Dettes du vendeur connecté
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des dettes }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux vendeurs }
 */
router.get("/me/debts", authenticate, authorize("VENDOR"), getMyDebts);

/**
 * @openapi
 * /api/v1/vendors/me:
 *   put:
 *     tags: [Vendors]
 *     summary: Modifier son profil (vendeur)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Profil mis à jour }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé aux vendeurs }
 */
router.put("/me", authenticate, authorize("VENDOR"), updateMe);

/**
 * @openapi
 * /api/v1/vendors/{id}:
 *   get:
 *     tags: [Vendors]
 *     summary: Détail d'un vendeur (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Vendeur récupéré }
 *       404: { description: Vendeur introuvable }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.get("/:id", authenticate, authorize("ADMIN"), getVendorById);

/**
 * @openapi
 * /api/v1/vendors/{id}:
 *   put:
 *     tags: [Vendors]
 *     summary: Modifier un vendeur (ADMIN)
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
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Vendeur mis à jour }
 *       404: { description: Vendeur introuvable }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.put("/:id", authenticate, authorize("ADMIN"), updateVendor);

/**
 * @openapi
 * /api/v1/vendors/{id}:
 *   delete:
 *     tags: [Vendors]
 *     summary: Supprimer un vendeur (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Vendeur supprimé }
 *       404: { description: Vendeur introuvable }
 *       401: { description: Non authentifié }
 *       403: { description: Réservé à l'admin }
 */
router.delete("/:id", authenticate, authorize("ADMIN"), deleteVendor);

export default router;
