import { Op } from "sequelize";
import { Stand } from "../database.js";
import { sendResponse } from "../utils/response.js";

/**
 * GET /api/public/stands/overview
 * Returns available zones with stand counts per category and price ranges.
 * Used by the mobile app to display the stand listing page.
 */
export async function getPublicStandsOverview(req, res) {
    try {
        const stands = await Stand.findAll({
            where: { status: "AVAILABLE" },
            attributes: ["zone", "category", "monthlyPrice"],
            order: [["zone", "ASC"]],
        });

        // Group by zone
        const zonesMap = {};
        for (const stand of stands) {
            const zone = stand.zone;
            const category = stand.category || "STANDARD";
            const price = Number(stand.monthlyPrice);

            if (!zonesMap[zone]) {
                zonesMap[zone] = {
                    zone,
                    standard: { count: 0, prices: [] },
                    premium: { count: 0, prices: [] },
                };
            }

            if (category === "PREMIUM") {
                zonesMap[zone].premium.count++;
                zonesMap[zone].premium.prices.push(price);
            } else {
                zonesMap[zone].standard.count++;
                zonesMap[zone].standard.prices.push(price);
            }
        }

        const data = Object.values(zonesMap).map((z) => ({
            zone: z.zone,
            standard: {
                available: z.standard.count,
                price_min: z.standard.prices.length ? Math.min(...z.standard.prices) : 10000,
                price_max: z.standard.prices.length ? Math.max(...z.standard.prices) : 30000,
            },
            premium: {
                available: z.premium.count,
                price_min: z.premium.prices.length ? Math.min(...z.premium.prices) : 35000,
                price_max: z.premium.prices.length ? Math.max(...z.premium.prices) : 50000,
            },
        }));

        return sendResponse(res, {
            status: 200,
            message: "Aperçu des stands disponibles",
            data,
        });
    } catch (err) {
        return sendResponse(res, {
            status: 500,
            success: false,
            message: "Erreur lors de la récupération des stands",
            errors: { server: err.message },
        });
    }
}
