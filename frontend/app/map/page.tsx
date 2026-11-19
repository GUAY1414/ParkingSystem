"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LocateFixed, MapPin, Navigation } from "lucide-react";
import { supabase } from "../../lib/supabase";

const ParkingMap = dynamic(() => import("../../components/parking/ParkingMap"), { ssr: false });

type Zone = { id: string; name: string; capacity: number; occupancy: number };
type Location = { id: string; name: string; address: string; latitude: number; longitude: number; parking_zones: Zone[] };

export default function MapPage() {
  const [selected, setSelected] = useState<Location | null>(null);
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadMapData() {
      if (!supabase) return;
      const { data } = await supabase
        .from("parking_locations")
        .select("id,name,address,latitude,longitude,parking_zones(id,name,capacity,occupancy,status)")
        .eq("status", "ACTIVE")
        .order("name");
      const loaded = (data ?? []) as unknown as Location[];
      setSelected(loaded[0] ?? null);

      const zoneIds = loaded.flatMap((location) => location.parking_zones?.map((zone) => zone.id) ?? []);
      if (zoneIds.length) {
        const { data: rateRows } = await supabase
          .from("parking_rates")
          .select("zone_id,amount_centavos,effective_from")
          .in("zone_id", zoneIds)
          .eq("status", "ACTIVE")
          .order("effective_from", { ascending: false });
        const nextRates: Record<string, number> = {};
        for (const row of rateRows ?? []) {
          if (!(row.zone_id in nextRates)) nextRates[row.zone_id] = row.amount_centavos;
        }
        setRates(nextRates);
      }
    }
    loadMapData();
  }, []);
  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fa" }}>
      <header style={{ height: 68, background: "white", borderBottom: "1px solid #e7edf4", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}><ArrowLeft size={17} /> Kuya meron pa?</Link>
        <button className="secondary-button" type="button"><LocateFixed size={16} /> Use my location</button>
      </header>
      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", minHeight: "calc(100vh - 68px)" }}>
        <div style={{ position: "relative" }}><ParkingMap onSelectLocation={(location) => setSelected(location)} /></div>
        <aside style={{ background: "white", borderLeft: "1px solid #e7edf4", padding: 22 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: "#66758a", textTransform: "uppercase", letterSpacing: ".08em" }}>Selected location</label>
          <h1 style={{ margin: "8px 0 4px", fontSize: 24 }}>{selected?.name ?? "Select a location"}</h1>
          <p style={{ color: "#66758a", fontSize: 13, margin: "0 0 18px" }}><MapPin size={14} style={{ display: "inline", marginRight: 5 }} />{selected?.address ?? "No location selected"}</p>
          <div style={{ borderTop: "1px solid #edf1f5", paddingTop: 12 }}>
            {(selected?.parking_zones ?? []).map((zone) => {
              const available = zone.capacity - zone.occupancy;
              const fee = rates[zone.id] ? `₱${(rates[zone.id] / 100).toFixed(0)}` : "—";
              return <div key={zone.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #edf1f5" }}><div><strong style={{ display: "block", fontSize: 13 }}>{zone.name}</strong><small style={{ color: available === 0 ? "#b42318" : "#66758a" }}>{available} of {zone.capacity} available</small></div><strong style={{ color: "#176b87" }}>{fee}</strong></div>;
            })}
          </div>
          <a className="primary-button" href={selected ? `https://www.openstreetmap.org/directions?to=${selected.latitude}%2C${selected.longitude}` : "https://www.openstreetmap.org/"} target="_blank" rel="noreferrer" style={{ width: "100%", marginTop: 18 }}><Navigation size={16} /> Open directions</a>
        </aside>
      </section>
    </main>
  );
}
