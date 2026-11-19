import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import vehicleRoutes from "./routes/vehicle.routes";
import parkingRoutes from "./routes/parking.routes";
import transactionRoutes from "./routes/transaction.routes";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/transactions", transactionRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "API route not found" },
  });
});

app.listen(env.port, () => {
  console.log(`Kuya meron pa? API listening on http://localhost:${env.port}`);
});

export default app;
