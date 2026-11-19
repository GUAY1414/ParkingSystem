import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { requireAuth, requireRole } from "../middleware/auth";
import { getUserSupabase } from "../config/supabase";
import { randomReference } from "../utils/plate";
import { failure, success } from "../utils/response";

const router = Router();

router.post("/sandbox/checkout", requireAuth, requireRole("DRIVER"), async (req, res) => {
  if (!env.paymentSandboxEnabled) return failure(res, "CONFIGURATION_ERROR", "Payment sandbox is disabled", 503);

  const parsed = z.object({ sessionId: z.string().uuid() }).safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid payment request", 422);

  const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  const supabase = getUserSupabase(accessToken);

  const { data: session, error } = await supabase
    .from("parking_sessions")
    .select("id,status,snapshot_rate_centavos")
    .eq("id", parsed.data.sessionId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (error) return failure(res, "SERVER_ERROR", "Could not validate parking session", 500);
  if (!session) return failure(res, "NOT_FOUND", "Active parking session was not found", 404);

  const reference = randomReference("SANDBOX");
  const { error: transactionError } = await supabase.from("transactions").insert({
    session_id: parsed.data.sessionId,
    reference,
    payment_method: "ONLINE",
    provider: "LOCAL_SANDBOX",
    amount_centavos: session.snapshot_rate_centavos,
    expected_amount_centavos: session.snapshot_rate_centavos,
    status: "PENDING",
    paid_at: null,
  });

  if (transactionError) {
    console.error("Sandbox transaction insert failed:", transactionError);
    return failure(res, "SERVER_ERROR", "Could not record sandbox payment", 500);
  }

  return success(res, {
    reference,
    provider: "LOCAL_SANDBOX",
    status: "PENDING",
    message: "This is a demonstration payment. No real payment was processed.",
  }, 201);
});

router.post("/paymongo/checkout", requireAuth, requireRole("DRIVER"), async (req, res) => {
  const parsed = z.object({ sessionId: z.string().uuid() }).safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid payment request", 422);
  if (!env.paymongoSecretKey) return failure(res, "CONFIGURATION_ERROR", "PayMongo sandbox is not configured", 503);

  const accessToken = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  const supabase = getUserSupabase(accessToken);

  const { data: session, error } = await supabase
    .from("parking_sessions")
    .select("id,status,snapshot_rate_centavos,vehicles(owner_id)")
    .eq("id", parsed.data.sessionId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (error) return failure(res, "SERVER_ERROR", "Could not validate parking session", 500);
  if (!session) return failure(res, "NOT_FOUND", "Active parking session was not found", 404);

  const reference = randomReference("ONLINE");
  const amountCentavos = session.snapshot_rate_centavos;

  const basicAuth = Buffer.from(`${env.paymongoSecretKey}:`).toString("base64");
  const paymongoResponse = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: [{
            name: "Kuya meron pa? parking session",
            quantity: 1,
            amount: amountCentavos,
            currency: "PHP",
          }],
          payment_method_types: ["gcash", "paymaya", "card"],
          description: `Parking session ${parsed.data.sessionId}`,
          metadata: { session_id: parsed.data.sessionId, transaction_reference: reference },
          success_url: `${env.frontendUrl}/payments/success?reference=${reference}`,
          cancel_url: `${env.frontendUrl}/payments/cancelled?reference=${reference}`,
        },
      },
    }),
  });

  const providerBody = await paymongoResponse.json();
  if (!paymongoResponse.ok) {
    console.error("PayMongo checkout error:", providerBody);
    return failure(res, "PROVIDER_ERROR", "Could not create online payment checkout", 502);
  }

  const checkout = providerBody.data;
  const { error: transactionError } = await supabase.from("transactions").insert({
    session_id: parsed.data.sessionId,
    reference,
    payment_method: "ONLINE",
    provider: "PAYMONGO",
    amount_centavos: amountCentavos,
    expected_amount_centavos: amountCentavos,
    status: "PENDING",
    paid_at: null,
  });

  if (transactionError) {
    console.error("Transaction insert failed:", transactionError);
    return failure(res, "SERVER_ERROR", "Could not record pending payment", 500);
  }

  return success(res, { reference, checkoutUrl: checkout.attributes.checkout_url, checkoutId: checkout.id }, 201);
});

router.post("/paymongo/webhook", (req, res) => {
  if (!env.paymongoWebhookSecret) {
    return failure(res, "CONFIGURATION_ERROR", "PayMongo webhook secret is not configured", 503);
  }

  const signature = String(req.headers["paymongo-signature"] ?? "");
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : JSON.stringify(req.body);
  const timestamp = signature.split(",").find((part) => part.trim().startsWith("t="))?.split("=")[1];
  const signatures = signature.split(",").map((part) => part.trim()).filter((part) => part.includes("=")).map((part) => part.split("=")[1]);

  if (!timestamp || !signatures.length) return failure(res, "UNAUTHORIZED", "Invalid webhook signature", 401);

  const expected = crypto.createHmac("sha256", env.paymongoWebhookSecret).update(`${timestamp}.${rawBody}`).digest("hex");
  if (!signatures.some((candidate) => crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(expected)))) {
    return failure(res, "UNAUTHORIZED", "Invalid webhook signature", 401);
  }

  return success(res, { received: true });
});

export default router;
