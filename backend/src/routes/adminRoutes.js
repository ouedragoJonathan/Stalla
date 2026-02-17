import express from "express";
import {
  approveVendorApplication,
  createAdminPayment,
  createAdminStand,
  createAdminVendor,
  createAllocation,
  deleteAdminStand,
  deleteAdminVendor,
  getSupportSettings,
  listAdminStalls,
  listAdminVendors,
  listVendorApplications,
  rejectVendorApplication,
  reportDebtors,
  updateSupportSettings,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

/**
 * @openapi
 * /api/admin/stalls:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des stands (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des stands }
 */
router.get("/stalls", listAdminStalls);

/**
 * @openapi
 * /api/admin/stalls:
 *   post:
 *     tags: [Admin]
 *     summary: Créer un stand (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, zone, monthly_price]
 *             properties:
 *               code: { type: string }
 *               zone: { type: string }
 *               monthly_price: { type: number }
 *     responses:
 *       201: { description: Stand créé }
 */
router.post("/stalls", createAdminStand);
router.delete("/stalls/:id", deleteAdminStand);

/**
 * @openapi
 * /api/admin/vendors:
 *   get:
 *     tags: [Admin]
 *     summary: Liste des vendeurs (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des vendeurs }
 */
router.get("/vendors", listAdminVendors);

/**
 * @openapi
 * /api/admin/vendors:
 *   post:
 *     tags: [Admin]
 *     summary: Créer un vendeur (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, phone, business_type]
 *             properties:
 *               email: { type: string, format: email }
 *               full_name: { type: string }
 *               phone: { type: string }
 *               business_type: { type: string }
 *     responses:
 *       201: { description: Vendeur créé (mot de passe généré) }
 */
router.post("/vendors", createAdminVendor);
router.delete("/vendors/:id", deleteAdminVendor);
router.get("/vendor-applications", listVendorApplications);
router.patch("/vendor-applications/:id/approve", approveVendorApplication);
router.patch("/vendor-applications/:id/reject", rejectVendorApplication);

/**
 * @openapi
 * /api/admin/allocations:
 *   post:
 *     tags: [Admin]
 *     summary: Assigner un vendeur à un stand (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vendor_id, stall_id, start_date]
 *             properties:
 *               vendor_id: { type: integer }
 *               stall_id: { type: integer }
 *               start_date: { type: string, format: date }
 *     responses:
 *       201: { description: Attribution créée }
 */
router.post("/allocations", createAllocation);

/**
 * @openapi
 * /api/admin/payments:
 *   post:
 *     tags: [Admin]
 *     summary: Enregistrer un paiement physique (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [allocation_id, amount_paid, period]
 *             properties:
 *               allocation_id: { type: integer }
 *               amount_paid: { type: number }
 *               period: { type: string, example: "2026-02" }
 *     responses:
 *       201: { description: Paiement enregistré }
 */
router.post("/payments", createAdminPayment);

/**
 * @openapi
 * /api/admin/reports/debtors:
 *   get:
 *     tags: [Admin]
 *     summary: Rapport des vendeurs débiteurs (ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Liste des débiteurs }
 */
router.get("/reports/debtors", reportDebtors);

router.get("/settings/support", getSupportSettings);
router.put("/settings/support", updateSupportSettings);

export default router;
