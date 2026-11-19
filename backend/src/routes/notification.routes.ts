import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { getUserSupabase } from "../config/supabase";
import { sendReceiptEmail } from "../services/email.service";
import { failure, success } from "../utils/response";

const router = Router();

router.post("/receipts/:receiptId/email", requireAuth, requireRole("DRIVER", "PARKING_ADMINISTRATOR", "SYSTEM_ADMINISTRATOR"), async (req, res) => {
  const parsed = z.object({ receiptId: z.string().uuid() }).safeParse({ receiptId: req.params.receiptId });
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid receipt identifier", 422);

  const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  const supabase = getUserSupabase(accessToken);

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", req.auth!.userId)
    .maybeSingle();

  if (!profile?.email) return failure(res, "NOT_FOUND", "Account email was not found", 404);

  const { data: receipt } = await supabase
    .from("receipts")
    .select("receipt_number,issued_at,transactions(amount_centavos,payment_method),parking_sessions(vehicles(plate_number),parking_zones(name,parking_locations(name)))")
    .eq("id", parsed.data.receiptId)
    .maybeSingle();

  if (!receipt) return failure(res, "NOT_FOUND", "Receipt was not found", 404);

  const transaction = Array.isArray(receipt.transactions) ? receipt.transactions[0] : receipt.transactions;
  const session = Array.isArray(receipt.parking_sessions) ? receipt.parking_sessions[0] : receipt.parking_sessions;
  const vehicle = Array.isArray(session?.vehicles) ? session.vehicles[0] : session?.vehicles;
  const zone = Array.isArray(session?.parking_zones) ? session.parking_zones[0] : session?.parking_zones;
  const locationData = Array.isArray(zone?.parking_locations) ? zone.parking_locations[0] : zone?.parking_locations;

  const result = await sendReceiptEmail({
    to: profile.email,
    receiptNumber: receipt.receipt_number,
    plateNumber: vehicle?.plate_number ?? "Not available",
    locationName: locationData?.name ?? "Not available",
    zoneName: zone?.name ?? "Not available",
    amountPesos: (transaction?.amount_centavos ?? 0) / 100,
    paymentMethod: transaction?.payment_method ?? "Unknown",
    issuedAt: receipt.issued_at,
  });

  return success(res, result);
});

export default router;
