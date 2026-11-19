import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../middleware/auth";
import { getServiceSupabase } from "../config/supabase";
import { failure, success } from "../utils/response";

const router = Router();

router.post("/admins", requireAuth, requireRole("SYSTEM_ADMINISTRATOR"), async (req, res) => {
  const parsed = z.object({ email: z.string().email(), firstName: z.string().trim().min(1).max(50), lastName: z.string().trim().min(1).max(50) }).safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid administrator details", 422);

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: { first_name: parsed.data.firstName, last_name: parsed.data.lastName },
    });
    if (error || !data.user) throw error ?? new Error("Invitation failed");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "PARKING_ADMINISTRATOR", first_name: parsed.data.firstName, last_name: parsed.data.lastName })
      .eq("id", data.user.id);
    if (profileError) throw profileError;

    await supabase.from("audit_logs").insert({
      actor_id: req.auth!.userId,
      action: "PARKING_ADMINISTRATOR_INVITED",
      entity_type: "profiles",
      entity_id: data.user.id,
      metadata: { email: parsed.data.email },
    });

    return success(res, { userId: data.user.id, role: "PARKING_ADMINISTRATOR", invitationSent: true }, 201);
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not create parking administrator invitation", 500);
  }
});

router.post("/attendants", requireAuth, requireRole("PARKING_ADMINISTRATOR"), async (req, res) => {
  const parsed = z.object({ email: z.string().email(), firstName: z.string().trim().min(1).max(50), lastName: z.string().trim().min(1).max(50) }).safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid attendant details", 422);

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: { first_name: parsed.data.firstName, last_name: parsed.data.lastName },
    });
    if (error || !data.user) throw error ?? new Error("Invitation failed");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "PARKING_ATTENDANT", first_name: parsed.data.firstName, last_name: parsed.data.lastName })
      .eq("id", data.user.id);
    if (profileError) throw profileError;

    await supabase.from("audit_logs").insert({
      actor_id: req.auth!.userId,
      action: "PARKING_ATTENDANT_INVITED",
      entity_type: "profiles",
      entity_id: data.user.id,
      metadata: { email: parsed.data.email },
    });

    return success(res, { userId: data.user.id, role: "PARKING_ATTENDANT", invitationSent: true }, 201);
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not create parking attendant invitation", 500);
  }
});

router.patch("/users/:userId/role", requireAuth, requireRole("SYSTEM_ADMINISTRATOR"), async (req, res) => {
  const roles = z.enum(["DRIVER", "PARKING_ATTENDANT", "PARKING_ADMINISTRATOR", "SYSTEM_ADMINISTRATOR"]);
  const parsed = z.object({ role: roles }).safeParse(req.body);
  if (!parsed.success) return failure(res, "VALIDATION_ERROR", "Invalid role", 422);

  try {
    const supabase = getServiceSupabase();
    const { data: previous } = await supabase.from("profiles").select("role").eq("id", req.params.userId).maybeSingle();
    const { error } = await supabase.from("profiles").update({ role: parsed.data.role }).eq("id", req.params.userId);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      actor_id: req.auth!.userId,
      action: "USER_ROLE_CHANGED",
      entity_type: "profiles",
      entity_id: req.params.userId,
      metadata: { previousRole: previous?.role ?? null, newRole: parsed.data.role },
    });

    return success(res, { userId: req.params.userId, role: parsed.data.role });
  } catch (error) {
    console.error(error);
    return failure(res, "SERVER_ERROR", "Could not change user role", 500);
  }
});

export default router;
