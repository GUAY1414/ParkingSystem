"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import RoleGuard from "../../components/RoleGuard";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ first_name: string | null; last_name: string | null; email: string; role: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const { data } = await supabase.from("profiles").select("first_name,last_name,email,role").eq("id", userId).maybeSingle();
      setProfile(data);
    }
    loadProfile();
  }, []);

  return (
    <RoleGuard allowedRoles={["DRIVER", "PARKING_ATTENDANT", "PARKING_ADMINISTRATOR", "SYSTEM_ADMINISTRATOR"]}>
      <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
        <div style={{ maxWidth: 700, margin: "auto" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 7, color: "#66758a", fontSize: 13, marginBottom: 12 }}><ArrowLeft size={15} /> Dashboard</Link>
          <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}><span style={{ width: 48, height: 48, borderRadius: 12, background: "#dff3ee", color: "#176b87", display: "grid", placeItems: "center" }}><User /></span><div><h1 style={{ margin: 0, fontSize: 24 }}>My profile</h1><small style={{ color: "#66758a" }}>{profile?.role?.replaceAll("_", " ")}</small></div></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}><label style={{ fontSize: 12, fontWeight: 800 }}>First name<input value={profile?.first_name ?? ""} readOnly style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 6 }} /></label><label style={{ fontSize: 12, fontWeight: 800 }}>Last name<input value={profile?.last_name ?? ""} readOnly style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 6 }} /></label></div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginTop: 12 }}>Email<input value={profile?.email ?? ""} readOnly style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 6 }} /></label>
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
