import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { getServiceSupabase } from "../config/supabase";
import { randomReference } from "../utils/plate";
import { failure, success } from "../utils/response";

const router = Router();

router.post("/cash", requireAuth, requireRole("PARKING_ATTENDANT"), async (req, res) => {
  const parsed = z.object({ sessionId: z.string().uuid(), amountCentavos: z.number().int().nonnegative() }).safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid cash payment information", 422);

  try {
    const supabase = getServiceSupabase();
    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select("id,status,snapshot_rate_centavos,zone_id")
      .eq("id", parsed.data.sessionId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) return failure(res, "NOT_FOUND", "Active parking session was not found", 404);

    const mismatch = parsed.data.amountCentavos !== session.snapshot_rate_centavos;
    const { data: transaction, error } = await supabase.from("transactions").insert({
      session_id: session.id,
      reference: randomReference("CASH"),
      payment_method: "CASH",
      provider: "CASH",
      amount_centavos: parsed.data.amountCentavos,
      expected_amount_centavos: session.snapshot_rate_centavos,
      status: mismatch ? "PENDING" : "CONFIRMED",
      discrepancy_status: mismatch ? "AMOUNT_MISMATCH" : null,
      paid_at: new Date().toISOString(),
    }).select().single();
    if (error) throw error;

    if (!mismatch) {
      const closedAt = new Date().toISOString();
      await supabase.from("parking_sessions").update({ status: "CLOSED", end_time: closedAt, updated_at: closedAt }).eq("id", session.id);

      const { data: zone } = await supabase.from("parking_zones").select("occupancy").eq("id", session.zone_id).single();
      if (zone) await supabase.from("parking_zones").update({ occupancy: Math.max(0, zone.occupancy - 1), updated_at: closedAt }).eq("id", session.zone_id);

      await supabase.from("receipts").insert({
        transaction_id: transaction.id,
        session_id: session.id,
        receipt_number: randomReference("RCPT"),
      });
    } else {
      await supabase.from("audit_logs").insert({ actor_id: req.auth!.userId, action: "CASH_PAYMENT_DISCREPANCY", entity_type: "transactions", entity_id: transaction.id, metadata: { amountCentavos: parsed.data.amountCentavos, expectedAmountCentavos: session.snapshot_rate_centavos } });
    }

    return success(res, { transaction, discrepancy: mismatch }, 201);
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not record cash payment", 500);
  }
});

export default router;
