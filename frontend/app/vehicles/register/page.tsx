"use client";

import Link from "next/link";
import { useState } from "react";
import CameraPlateScanner from "../../../components/parking/CameraPlateScanner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function RegisterVehiclePage() {
  const [plate, setPlate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [color, setColor] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveVehicle(value: string) {
    setPlate(value);
    setError("");

    if (!vehicleType) {
      setError("Select a vehicle type.");
      return;
    }
    if (!color) {
      setError("Select a vehicle color.");
      return;
    }

    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!/^([A-Z]{2,3}[0-9]{3,4}|[0-9]{3}[A-Z]{3})$/.test(normalized)) {
      setError("Enter a valid Philippine plate number, for example ABC1234.");
      return;
    }

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
      body: JSON.stringify({ plateNumber: normalized, vehicleType, color }),
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 800 }}>Vehicle type
                <select required value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 6 }}>
                  <option value="">Select vehicle type</option>
                  <option>Motorcycle</option><option>Sedan</option><option>SUV</option><option>Van</option><option>Pickup Truck</option>
                </select>
              </label>
              <label style={{ fontSize: 12, fontWeight: 800 }}>Vehicle color
                <select required value={color} onChange={(event) => setColor(event.target.value)} style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 6 }}>
                  <option value="">Select vehicle color</option>
                  <option>Black</option><option>White</option><option>Gray</option><option>Silver</option><option>Red</option><option>Blue</option><option>Green</option><option>Yellow</option><option>Orange</option><option>Brown</option>
                </select>
              </label>
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
