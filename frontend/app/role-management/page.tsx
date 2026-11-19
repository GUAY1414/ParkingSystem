"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import RoleGuard from "../../components/RoleGuard";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, UserCog } from "lucide-react";

export default function RoleManagementPage() {
  const [role, setRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadRole() {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
      setRole(data?.role ?? "");
    }
    loadRole();
  }, []);

  async function inviteUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setSubmitting(true);

    if (!supabase) {
      setStatus("Supabase is not configured.");
      setSubmitting(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setStatus("Sign in with an authorized account.");
      setSubmitting(false);
      return;
    }

    const endpoint = role === "SYSTEM_ADMINISTRATOR" ? "/roles/admins" : role === "PARKING_ADMINISTRATOR" ? "/roles/attendants" : "";
    if (!endpoint) {
      setStatus("Your role cannot provision accounts.");
      setSubmitting(false);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    const body = await response.json();
    setSubmitting(false);

    if (!response.ok) setStatus(body.error?.message ?? "Could not send invitation.");
    else setStatus(`Invitation sent for ${email}.`);
  }

  const targetRole = role === "SYSTEM_ADMINISTRATOR" ? "Parking Administrator" : role === "PARKING_ADMINISTRATOR" ? "Parking Attendant" : "Authorized account";

  return (
    <RoleGuard allowedRoles={["PARKING_ADMINISTRATOR", "SYSTEM_ADMINISTRATOR"]}>
      <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
        <div style={{ maxWidth: 900, margin: "auto" }}>
          <Link href="/dashboard" style={{ display: "flex", gap: 7, alignItems: "center", color: "#66758a", fontSize: 13, marginBottom: 12 }}><ArrowLeft size={15} /> Dashboard</Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}><UserCog color="#176b87" /><h1 style={{ margin: 0 }}>Account provisioning</h1></div>
          <p style={{ color: "#66758a", fontSize: 14 }}>Authorized invitations for {targetRole} accounts.</p>
          <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 18, maxWidth: 620 }}>
            <form onSubmit={inviteUser}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Email address</label>
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginBottom: 12 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 800 }}>First name<input required value={firstName} onChange={(event) => setFirstName(event.target.value)} style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 6 }} /></label>
                <label style={{ fontSize: 12, fontWeight: 800 }}>Last name<input required value={lastName} onChange={(event) => setLastName(event.target.value)} style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 6 }} /></label>
              </div>
              <button className="primary-button" type="submit" disabled={submitting} style={{ width: "100%", marginTop: 14, border: 0 }}>{submitting ? "Sending invitation…" : `Invite ${targetRole}`}</button>
              {status && <p role="status" style={{ color: "#66758a", background: "#f4f7fa", borderRadius: 8, padding: 10, fontSize: 12 }}>{status}</p>}
            </form>
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
