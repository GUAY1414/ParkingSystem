"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, LocateFixed, MapPin, Navigation } from "lucide-react";

const ParkingMap = dynamic(() => import("../../components/parking/ParkingMap"), { ssr: false });

export default function MapPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fa" }}>
      <header style={{ height: 68, background: "white", borderBottom: "1px solid #e7edf4", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}><ArrowLeft size={17} /> Kuya meron pa?</Link>
        <button className="secondary-button" type="button"><LocateFixed size={16} /> Use my location</button>
      </header>
      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", minHeight: "calc(100vh - 68px)" }}>
        <div style={{ position: "relative" }}><ParkingMap /></div>
        <aside style={{ background: "white", borderLeft: "1px solid #e7edf4", padding: 22 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: "#66758a", textTransform: "uppercase", letterSpacing: ".08em" }}>Selected location</label>
          <h1 style={{ margin: "8px 0 4px", fontSize: 24 }}>Ermita Parking</h1>
          <p style={{ color: "#66758a", fontSize: 13, margin: "0 0 18px" }}><MapPin size={14} style={{ display: "inline", marginRight: 5 }} />Manila, controlled sample location</p>
          <div style={{ borderTop: "1px solid #edf1f5", paddingTop: 12 }}>
            {[["Zone A", "12 available", "₱50"],["Zone B", "5 available", "₱70"]].map(([zone, available, rate]) => (
              <div key={zone} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: "1px solid #edf1f5" }}><div><strong style={{ display: "block", fontSize: 13 }}>{zone}</strong><small style={{ color: "#66758a" }}>{available}</small></div><strong style={{ color: "#176b87" }}>{rate}</strong></div>
            ))}
          </div>
          <a className="primary-button" href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer" style={{ width: "100%", marginTop: 18 }}><Navigation size={16} /> Open directions</a>
        </aside>
      </section>
    </main>
  );
}
