import type { NextFunction, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import { failure } from "../utils/response";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return failure(res, "CONFIGURATION_ERROR", "Supabase server configuration is missing", 500);
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return failure(res, "UNAUTHORIZED", "Authentication required", 401);

  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    console.error("Supabase token validation failed:", error?.message ?? "No authenticated user");
    return failure(res, "UNAUTHORIZED", "Invalid or expired session", 401);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  req.auth = { userId: data.user.id, role: profile?.role ?? "DRIVER" };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return failure(res, "UNAUTHORIZED", "Authentication required", 401);
    if (!roles.includes(req.auth.role)) {
      return failure(res, "FORBIDDEN", "This action is not permitted for your role", 403);
    }
    next();
  };
}
