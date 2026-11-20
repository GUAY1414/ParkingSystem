"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3 } from "lucide-react";
import RoleGuard from "../../components/RoleGuard";
import { supabase } from "../../lib/supabase";

type ActiveSession = {
  id: string;
  qr_reference: string;
  start_time: string;
  snapshot_rate_centavos: number;
  status: string;
  vehicles: { plate_number: string };
  parking_zones: { name: string; parking_locations: { name: string; address: string } };
};

export default function ActiveSessionPage() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (!userId) return;
      const { data: vehicles } = await supabase.from("vehicles").select("id").eq("owner_id", userId);
      const vehicleIds = (vehicles ?? []).map((vehicle) => vehicle.id);
      if (!vehicleIds.length) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("parking_sessions")
        .select("id,qr_reference,start_time,snapshot_rate_centavos,status,vehicles(plate_number),parking_zones(name,parking_locations(name,address))")
        .in("vehicle_id", vehicleIds)
        .eq("status", "ACTIVE")
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSession(data as unknown as ActiveSession | null);
      setLoading(false);
    }
    loadSession();
  }, []);

  return (
    <RoleGuard allowedRoles={["DRIVER"]}>
      <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
        <div style={{ maxWidth: 700, margin: "auto" }}>
          <Link href="/driver" style={{ display: "flex", alignItems: "center", gap: 7, color: "#66758a", fontSize: 13, marginBottom: 12 }}><ArrowLeft size={15} /> Driver workspace</Link>
          <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Clock3 color="#176b87" /><h1 style={{ margin: 0 }}>Active session</h1></div>
            {loading ? <p style={{ color: "#66758a" }}>Loading active session…</p> : !session ? <p style={{ color: "#66758a" }}>You do not have an active parking session.</p> : (
              <div style={{ marginTop: 18 }}>
                <div className="metric-grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
                  <article className="metric-card"><span>Plate number</span><strong>{session.vehicles?.plate_number}</strong></article>
                  <article className="metric-card"><span>Fixed rate</span><strong>₱{(session.snapshot_rate_centavos / 100).toFixed(2)}</strong></article>
                </div>
                <p><strong>Location:</strong> {session.parking_zones?.parking_locations?.name}</p>
                <p><strong>Zone:</strong> {session.parking_zones?.name}</p>
                <p><strong>Started:</strong> {new Date(session.start_time).toLocaleString()}</p>
                <p><strong>QR reference:</strong> {session.qr_reference}</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </RoleGuard>
  );
}
