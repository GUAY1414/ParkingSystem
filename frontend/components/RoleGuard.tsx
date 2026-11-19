"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export type SupportedRole = "DRIVER" | "PARKING_ATTENDANT" | "PARKING_ADMINISTRATOR" | "SYSTEM_ADMINISTRATOR";

export default function RoleGuard({ allowedRoles, children }: { allowedRoles: SupportedRole[]; children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function authorize() {
      if (!supabase) {
        router.replace("/login");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionData.session.user.id)
        .maybeSingle();

      if (!profile || !allowedRoles.includes(profile.role as SupportedRole)) {
        router.replace("/dashboard");
        return;
      }

      setAuthorized(true);
    }

    authorize();
  }, [allowedRoles, router]);

  if (!authorized) {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#66758a" }}>Verifying workspace access…</main>;
  }

  return <>{children}</>;
}
