"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CarFront, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Vehicle = { id: string; plate_number: string; make: string | null; model: string | null; color: string | null };

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadVehicles() {
      if (!supabase) {
        setError("Supabase configuration is missing.");
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      let token = sessionData.session?.access_token;

      if (!token) {
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
        token = refreshError ? undefined : refreshed.session?.access_token;
      }

      if (!token) {
        setError("Sign in to view your vehicles.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (!response.ok) setError(body.error?.message ?? "Could not retrieve vehicles.");
      else setVehicles(body.data ?? []);
      setLoading(false);
    }

    loadVehicles();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div><Link href="/dashboard" style={{ display: "flex", gap: 7, alignItems: "center", color: "#66758a", fontSize: 13, marginBottom: 8 }}><ArrowLeft size={15} /> Dashboard</Link><h1 style={{ margin: 0 }}>My vehicles</h1></div>
          <Link href="/vehicles/register" className="primary-button"><Plus size={16} /> Register vehicle</Link>
        </header>
        <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 18 }}>
          {loading ? <div style={{ minHeight: 220, display: "grid", placeItems: "center", color: "#66758a" }}>Loading vehicles…</div> : error ? <div style={{ minHeight: 220, display: "grid", placeItems: "center", color: "#b42318" }}>{error}</div> : vehicles.length === 0 ? <div style={{ minHeight: 220, display: "grid", placeItems: "center", textAlign: "center", color: "#66758a" }}><div><span style={{ width: 48, height: 48, borderRadius: 12, background: "#dff3ee", color: "#176b87", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><CarFront /></span><strong style={{ display: "block", color: "#10233f" }}>No registered vehicles</strong><small>Register a vehicle to begin parking sessions.</small></div></div> : <div>{vehicles.map((vehicle) => <article key={vehicle.id} style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #edf1f5", padding: "14px 4px" }}><span style={{ width: 42, height: 42, borderRadius: 10, background: "#dff3ee", color: "#176b87", display: "grid", placeItems: "center" }}><CarFront size={20} /></span><div><strong style={{ display: "block" }}>{vehicle.plate_number}</strong><small style={{ color: "#66758a" }}>[{[vehicle.make, vehicle.model, vehicle.color].filter(Boolean).join(" · ") || "Vehicle details"}]</small></div></article>)}</div>}
        </section>
      </div>
    </main>
  );
}
