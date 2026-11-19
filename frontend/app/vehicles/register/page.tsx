"use client";

import Link from "next/link";
import { useState } from "react";
import CameraPlateScanner from "../../../components/parking/CameraPlateScanner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function RegisterVehiclePage() {
  const [plate, setPlate] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveVehicle(value: string) {
    setPlate(value);
    setError("");

    if (!supabase) {
      setError("Supabase configuration is missing.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    let token = sessionData.session?.access_token;

    if (!token) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      token = refreshError ? undefined : refreshed.session?.access_token;
    }

    if (!token) {
      setError("Sign in again before registering a vehicle.");
      await supabase.auth.signOut();
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      setError("Your session is invalid or expired. Please sign in again.");
      await supabase.auth.signOut();
      return;
    }

    setSaving(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plateNumber: value, make, model, color }),
    });
    const body = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(body.error?.message ?? "Could not register vehicle.");
      return;
    }

    setSaved(true);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
      <div style={{ maxWidth: 620, margin: "auto" }}>
        <Link href="/vehicles" style={{ display: "flex", gap: 7, alignItems: "center", color: "#66758a", fontSize: 13, marginBottom: 12 }}><ArrowLeft size={15} /> My vehicles</Link>
        <h1 style={{ fontSize: 28, margin: "0 0 20px" }}>Register vehicle</h1>
        {saved ? (
          <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 32, textAlign: "center" }}>
            <CheckCircle2 size={42} color="#397261" style={{ margin: "auto" }} />
            <h2>Vehicle registered</h2><p style={{ color: "#66758a", letterSpacing: ".08em", fontWeight: 800 }}>{plate}</p>
            <Link href="/vehicles" className="secondary-button">View vehicles</Link>
          </section>
        ) : (
          <section>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
              {[['Make', make, setMake], ['Model', model, setModel], ['Color', color, setColor]].map(([label, value, setter]) => (
                <label key={String(label)} style={{ fontSize: 12, fontWeight: 800 }}>{String(label)}<input value={String(value)} onChange={(event) => (setter as (value: string) => void)(event.target.value)} style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 6, fontWeight: 400 }} /></label>
              ))}
            </div>
            {error && <p role="alert" style={{ color: "#b42318", background: "#fff1f0", borderRadius: 8, padding: 10, fontSize: 12 }}>{error}</p>}
            <CameraPlateScanner onPlateConfirmed={saveVehicle} />
            {saving && <p style={{ color: "#66758a", fontSize: 12 }}>Saving vehicle…</p>}
          </section>
        )}
      </div>
    </main>
  );
}
