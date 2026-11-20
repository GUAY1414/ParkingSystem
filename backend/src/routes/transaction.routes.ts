import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { getServiceSupabase, getUserSupabase } from "../config/supabase";
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

    let receipt = null;
    if (!mismatch) {
      const closedAt = new Date().toISOString();
      await supabase.from("parking_sessions").update({ status: "CLOSED", end_time: closedAt, updated_at: closedAt }).eq("id", session.id);
      const { data: zone } = await supabase.from("parking_zones").select("occupancy").eq("id", session.zone_id).single();
      if (zone) await supabase.from("parking_zones").update({ occupancy: Math.max(0, zone.occupancy - 1), updated_at: closedAt }).eq("id", session.zone_id);

      const { data: createdReceipt, error: receiptError } = await supabase.from("receipts").insert({
        transaction_id: transaction.id,
        session_id: session.id,
        receipt_number: randomReference("RCPT"),
      }).select("id,receipt_number,issued_at").single();
      if (receiptError) throw receiptError;
      receipt = createdReceipt;
    } else {
      await supabase.from("audit_logs").insert({ actor_id: req.auth!.userId, action: "CASH_PAYMENT_DISCREPANCY", entity_type: "transactions", entity_id: transaction.id, metadata: { amountCentavos: parsed.data.amountCentavos, expectedAmountCentavos: session.snapshot_rate_centavos } });
    }

    return success(res, { transaction, receipt, discrepancy: mismatch }, 201);
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not record cash payment", 500);
  }
});

router.post("/settle", requireAuth, requireRole("PARKING_ATTENDANT"), async (req, res) => {
  const parsed = z.object({
    sessionId: z.string().uuid(),
    paymentMethod: z.enum(["CASH", "QR"]),
    amountCentavos: z.number().int().nonnegative().optional(),
  }).safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid payment information", 422);

  try {
    const supabase = getServiceSupabase();
    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select("id,status,snapshot_rate_centavos,zone_id,vehicle_id,vehicles(owner_id,plate_number)")
      .eq("id", parsed.data.sessionId)
      .eq("status", "ACTIVE")
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!session) return failure(res, "NOT_FOUND", "Active parking session was not found", 404);

    const paidAmount = parsed.data.amountCentavos ?? session.snapshot_rate_centavos;
    const mismatch = paidAmount !== session.snapshot_rate_centavos;
    const expected = session.snapshot_rate_centavos;
    const closedAt = new Date().toISOString();
    const reference = randomReference(parsed.data.paymentMethod);
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        session_id: session.id,
        reference,
        payment_method: parsed.data.paymentMethod === "CASH" ? "CASH" : "ONLINE",
        provider: parsed.data.paymentMethod === "QR" ? "QR_PAYMENT" : "CASH",
        amount_centavos: paidAmount,
        expected_amount_centavos: expected,
        status: mismatch ? "PENDING" : "CONFIRMED",
        discrepancy_status: mismatch ? "AMOUNT_MISMATCH" : null,
        paid_at: mismatch ? null : closedAt,
      })
      .select()
      .single();
    if (transactionError) throw transactionError;

    let receipt = null;
    if (!mismatch) {
      await supabase.from("parking_sessions").update({ status: "CLOSED", end_time: closedAt, updated_at: closedAt }).eq("id", session.id);
      const { data: zone } = await supabase.from("parking_zones").select("occupancy").eq("id", session.zone_id).single();
      if (zone) await supabase.from("parking_zones").update({ occupancy: Math.max(0, zone.occupancy - 1), updated_at: closedAt }).eq("id", session.zone_id);

      const { data: createdReceipt, error: receiptError } = await supabase
        .from("receipts")
        .insert({ transaction_id: transaction.id, session_id: session.id, receipt_number: randomReference("RCPT") })
        .select("id,receipt_number,issued_at")
        .single();
      if (receiptError) throw receiptError;
      receipt = createdReceipt;

      const vehicleData = Array.isArray(session.vehicles) ? session.vehicles[0] : session.vehicles;
      if (vehicleData?.owner_id) {
        await supabase.from("notifications").insert({
          profile_id: vehicleData.owner_id,
          session_id: session.id,
          type: "PAYMENT_CONFIRMED",
          message: `Payment confirmed for ${vehicleData.plate_number ?? "your vehicle"}: ₱${(expected / 100).toFixed(2)} via ${parsed.data.paymentMethod}.`,
          status: "UNREAD",
        });
      }
    }

    await supabase.from("audit_logs").insert({
      actor_id: req.auth!.userId,
      action: mismatch ? "PAYMENT_DISCREPANCY" : "PARKING_PAYMENT_RECORDED",
      entity_type: "transactions",
      entity_id: transaction.id,
      metadata: { sessionId: session.id, paymentMethod: parsed.data.paymentMethod, paidAmount, expectedAmount: expected },
    });

    return success(res, { transaction, receipt, discrepancy: mismatch, sessionClosed: !mismatch }, 201);
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not settle parking payment", 500);
  }
});

router.get("/receipts/me", requireAuth, requireRole("DRIVER"), async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    const supabase = getUserSupabase(accessToken);
    const { data: ownedVehicles } = await supabase.from("vehicles").select("id").eq("owner_id", req.auth!.userId);
    const vehicleIds = (ownedVehicles ?? []).map((vehicle) => vehicle.id);
    if (!vehicleIds.length) return success(res, []);

    const { data: sessions } = await supabase.from("parking_sessions").select("id,vehicle_id").in("vehicle_id", vehicleIds);
    const sessionIds = (sessions ?? []).map((session) => session.id);
    if (!sessionIds.length) return success(res, []);

    const { data, error } = await supabase
      .from("receipts")
      .select("id,receipt_number,issued_at,session_id,transaction_id")
      .in("session_id", sessionIds)
      .order("issued_at", { ascending: false });
    if (error) throw error;
    return success(res, data ?? []);
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not retrieve receipts", 500);
  }
});

export default router;
