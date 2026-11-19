import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { success } from "../utils/response";

const router = Router();

router.get("/me", requireAuth, (req, res) => {
  success(res, { userId: req.auth?.userId, role: req.auth?.role });
});

export default router;
