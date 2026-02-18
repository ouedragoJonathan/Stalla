import express from "express";
import { getPublicStandsOverview } from "../controllers/publicController.js";

const router = express.Router();

/**
 * GET /api/public/stands/overview
 * Returns available zones with stand counts per category and price ranges.
 * No authentication required.
 */
router.get("/stands/overview", getPublicStandsOverview);

export default router;
