import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./config.js";
import { initDatabase } from "./database.js";
import { swaggerSpec } from "./swagger.js";
import authRoutes from "./routes/authRoutes.js";
import standRoutes from "./routes/standRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { sendResponse } from "./utils/response.js";
import { startDebtCronJob, runDebtJob } from "./cron/debtJob.js";
import { authenticate, authorize } from "./middlewares/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use((req, res, next) => {
  console.log(`Requête reçue : ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use("/receipts", express.static(path.join(process.cwd(), "receipts")));

// Documentation Swagger (OpenAPI)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/stands", standRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Lancer manuellement le job des dettes (créé les dettes du mois pour les stands occupés)
app.post("/api/v1/admin/run-debt-job", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    await runDebtJob();
    return sendResponse(res, { status: 200, message: "Job des dettes exécuté", data: null });
  } catch (err) {
    return sendResponse(res, {
      status: 500,
      success: false,
      message: "Erreur lors du job des dettes",
      errors: { server: err.message },
    });
  }
});

app.get("/health", (req, res) => {
  return sendResponse(res, {
    status: 200,
    message: "API STALLA opérationnelle",
    data: { uptime: process.uptime() },
  });
});

app.use((req, res) => {
  return sendResponse(res, {
    status: 404,
    success: false,
    message: "Ressource non trouvée",
    errors: { path: req.originalUrl },
  });
});

const start = async () => {
  let dbOk = false;
  try {
    await initDatabase();
    dbOk = true;
    startDebtCronJob();
  } catch (err) {
    console.error("⚠️ MySQL non disponible:", err.message);
    console.error("   Vérifiez que MySQL est démarré et que .env contient DB_USER, DB_PASSWORD, DB_NAME.");
    console.error("   Le serveur démarre quand même ; les routes API échoueront sans base.");
  }

  app.listen(config.port, () => {
    console.log(`Serveur STALLA démarré sur http://localhost:${config.port}`);
    if (!dbOk) console.log("   Mode sans base de données (MySQL requis pour l'API).");
  });
};

start();
