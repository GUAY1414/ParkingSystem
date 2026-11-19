import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export function getServiceSupabase() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error("Supabase server configuration is missing");
  }

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getUserSupabase(accessToken: string) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase server configuration is missing");
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
