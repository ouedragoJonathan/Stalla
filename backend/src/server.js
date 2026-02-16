import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { config } from "./config.js";
import { initDatabase } from "./database.js";
import { swaggerSpec } from "./swagger.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import { sendResponse } from "./utils/response.js";
import { runDebtJob, startDebtCronJob } from "./cron/debtJob.js";
import { authenticate, authorize } from "./middlewares/auth.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use("/receipts", express.static(path.join(process.cwd(), "receipts")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/v1/vendor", vendorRoutes);

app.post("/api/admin/run-debt-job", authenticate, authorize("ADMIN"), async (req, res) => {
  try {
    const result = await runDebtJob();
    return sendResponse(res, { status: 200, message: "Job des dettes exécuté", data: result });
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
    console.error("MySQL non disponible:", err.message);
    console.error("Le serveur démarre quand même ; les routes API échoueront sans base.");
  }

  app.listen(config.port, () => {
    console.log(`Serveur STALLA démarré sur http://localhost:${config.port}`);
    if (!dbOk) console.log("Mode sans base de données (MySQL requis pour l'API).");
  });
};

start();
