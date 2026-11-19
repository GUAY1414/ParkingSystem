import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { getServiceSupabase } from "../config/supabase";
import { randomReference } from "../utils/plate";
import { failure, success } from "../utils/response";

const router = Router();

router.get("/locations", requireAuth, async (_req, res) => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("parking_locations")
    .select("id,name,address,latitude,longitude,status, parking_zones(id,name,capacity,occupancy,status)")
    .eq("status", "ACTIVE")
    .order("name");
  if (error) return failure(res, "SERVER_ERROR", "Could not retrieve parking locations", 500);
  return success(res, data ?? []);
});

const sessionSchema = z.object({ vehicleId: z.string().uuid(), zoneId: z.string().uuid() });

router.post("/sessions", requireAuth, requireRole("PARKING_ATTENDANT"), async (req, res) => {
  const parsed = sessionSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid session information", 422);

  try {
    const supabase = getServiceSupabase();

    const { data: assignment } = await supabase
      .from("attendant_assignments")
      .select("id")
      .eq("attendant_id", req.auth!.userId)
      .eq("zone_id", parsed.data.zoneId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (!assignment) return failure(res, "ASSIGNMENT_REQUIRED", "You are not assigned to this zone", 403);

    const { data: active } = await supabase
      .from("parking_sessions")
      .select("id")
      .eq("vehicle_id", parsed.data.vehicleId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (active) return failure(res, "ACTIVE_SESSION_EXISTS", "This vehicle already has an active session", 409);

    const { data: zone } = await supabase
      .from("parking_zones")
      .select("id,capacity,occupancy,status")
      .eq("id", parsed.data.zoneId)
      .single();
    if (!zone || zone.status !== "ACTIVE") return failure(res, "NOT_FOUND", "Parking zone is unavailable", 404);
    if (zone.occupancy >= zone.capacity) return failure(res, "ZONE_FULL", "This parking zone is full", 409);

    const { data: rate } = await supabase
      .from("parking_rates")
      .select("amount_centavos")
      .eq("zone_id", parsed.data.zoneId)
      .eq("status", "ACTIVE")
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!rate) return failure(res, "RATE_NOT_CONFIGURED", "This zone has no active fixed rate", 422);

    const qrReference = randomReference("KMP");
    const { data: session, error } = await supabase.from("parking_sessions").insert({
      vehicle_id: parsed.data.vehicleId,
      zone_id: parsed.data.zoneId,
      attendant_id: req.auth!.userId,
      snapshot_rate_centavos: rate.amount_centavos,
      qr_reference: qrReference,
      status: "ACTIVE",
    }).select("*, parking_zones(name, parking_locations(name,address))").single();

    if (error) {
      if (error.code === "23505") return failure(res, "ACTIVE_SESSION_EXISTS", "This vehicle already has an active session", 409);
      throw error;
    }

    await supabase.from("parking_zones").update({ occupancy: zone.occupancy + 1, updated_at: new Date().toISOString() }).eq("id", parsed.data.zoneId);
    await supabase.from("audit_logs").insert({ actor_id: req.auth!.userId, action: "PARKING_SESSION_CREATED", entity_type: "parking_sessions", entity_id: session.id, metadata: { zoneId: parsed.data.zoneId, qrReference } });

    return success(res, session, 201);
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not create parking session", 500);
  }
});

router.get("/sessions/qr/:reference", requireAuth, requireRole("PARKING_ATTENDANT", "PARKING_ADMINISTRATOR"), async (req, res) => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("parking_sessions")
    .select("id,qr_reference,status,start_time,end_time,snapshot_rate_centavos,vehicles(plate_number,make,model,color),parking_zones(name,parking_locations(name,address))")
    .eq("qr_reference", req.params.reference)
    .maybeSingle();
  if (error) return failure(res, "SERVER_ERROR", "Could not verify QR session", 500);
  if (!data) return failure(res, "INVALID_QR_REFERENCE", "Parking session was not found", 404);
  return success(res, data);
});

export default router;
