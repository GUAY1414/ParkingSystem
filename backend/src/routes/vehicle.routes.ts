import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { getUserSupabase } from "../config/supabase";
import { normalizePlate } from "../utils/plate";
import { failure, success } from "../utils/response";

const router = Router();

const vehicleSchema = z.object({
  plateNumber: z.string().trim().min(3).max(20),
  make: z.string().trim().max(50).optional(),
  model: z.string().trim().max(50).optional(),
  color: z.string().trim().max(30).optional(),
});

router.post("/", requireAuth, requireRole("DRIVER"), async (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid vehicle information", 422);

  const normalizedPlate = normalizePlate(parsed.data.plateNumber);
  if (normalizedPlate.length < 3) return failure(res, "VALIDATION_ERROR", "Enter a valid plate number", 422);

  try {
    const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    const supabase = getUserSupabase(accessToken);
    const { data, error } = await supabase.from("vehicles").insert({
      owner_id: req.auth!.userId,
      plate_number: parsed.data.plateNumber.toUpperCase(),
      normalized_plate: normalizedPlate,
      make: parsed.data.make,
      model: parsed.data.model,
      color: parsed.data.color,
    }).select().single();

    if (error) {
      console.error("Vehicle insert failed:", error);
      if (error.code === "23505") return failure(res, "VEHICLE_ALREADY_REGISTERED", "This vehicle plate is already registered", 409);
      throw error;
    }
    return success(res, data, 201);
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not register vehicle", 500);
  }
});

router.get("/", requireAuth, requireRole("DRIVER"), async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    const supabase = getUserSupabase(accessToken);
    const { data, error } = await supabase.from("vehicles").select("*").eq("owner_id", req.auth!.userId).order("created_at", { ascending: false });
    if (error) throw error;
    return success(res, data ?? []);
  } catch (error) {
    return failure(res, "SERVER_ERROR", "Could not retrieve vehicles", 500);
  }
});

router.get("/lookup", requireAuth, requireRole("PARKING_ATTENDANT", "PARKING_ADMINISTRATOR"), async (req, res) => {
  const normalizedPlate = normalizePlate(String(req.query.plate ?? ""));
  if (!normalizedPlate) return failure(res, "VALIDATION_ERROR", "A plate number is required", 422);

  try {
    const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    const supabase = getUserSupabase(accessToken);
    const { data, error } = await supabase.from("vehicles").select("id, plate_number, make, model, color, status").eq("normalized_plate", normalizedPlate).maybeSingle();
    if (error) throw error;
    if (!data) return success(res, null, 200);
    return success(res, data);
  } catch (error) {
    return failure(res, "SERVER_ERROR", "Could not look up vehicle", 500);
  }
});

export default router;
