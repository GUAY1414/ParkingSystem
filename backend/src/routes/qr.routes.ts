import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { getUserSupabase } from "../config/supabase";
import { failure, success } from "../utils/response";

const router = Router();

router.get("/session/:reference", requireAuth, requireRole("PARKING_ATTENDANT", "PARKING_ADMINISTRATOR"), async (req, res) => {
  const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  const supabase = getUserSupabase(accessToken);

  const { data, error } = await supabase
    .from("parking_sessions")
    .select("id,qr_reference,status,start_time,end_time,snapshot_rate_centavos,vehicles(plate_number,make,color),parking_zones(name,parking_locations(name,address))")
    .eq("qr_reference", req.params.reference)
    .maybeSingle();

  if (error) return failure(res, "SERVER_ERROR", "Could not verify QR reference", 500);
  if (!data) return failure(res, "INVALID_QR_REFERENCE", "Parking session was not found", 404);

  return success(res, data);
});

export default router;
