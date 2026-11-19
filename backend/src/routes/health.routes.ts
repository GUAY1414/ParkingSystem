import { Router } from "express";
import { success } from "../utils/response";

const router = Router();

router.get("/health", (_req, res) => {
  success(res, {
    service: "Kuya meron pa? API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
