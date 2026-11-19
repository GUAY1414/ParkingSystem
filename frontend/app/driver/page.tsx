"use client";

import Link from "next/link";
import RoleGuard from "../../components/RoleGuard";
import { CarFront, MapPin, ReceiptText, User, Bell, Clock3 } from "lucide-react";

export default function DriverDashboard() {
  return (
    <RoleGuard allowedRoles={["DRIVER"]}>
      <main style={{ minHeight: "100vh", background: "#f4f7fa" }}>
        <header style={{ height: 68, background: "white", borderBottom: "1px solid #e7edf4", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
          <Link href="/" className="brand"><span className="brand-mark"><CarFront size={18} /></span><span><strong>Kuya meron pa?</strong><small>Driver</small></span></Link>
          <nav style={{ display: "flex", gap: 8 }}><Link href="/vehicles" className="secondary-button">Vehicles</Link><Link href="/profile" className="secondary-button">Profile</Link></nav>
        </header>
        <section style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", minHeight: "calc(100vh - 68px)" }}>
          <Link href="/map" style={{ position: "relative", background: "#dfe8e7", minHeight: 620 }}>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#66758a" }}><div style={{ textAlign: "center" }}><MapPin size={42} style={{ margin: "auto", color: "#176b87" }} /><strong style={{ display: "block", marginTop: 8 }}>Open interactive parking map</strong></div></div>
          </Link>
          <aside style={{ background: "white", borderLeft: "1px solid #e7edf4", padding: 18 }}>
            <h1 style={{ fontSize: 22, margin: "0 0 16px" }}>Driver workspace</h1>
            {[['Register Vehicle','/vehicles/register',CarFront],['My Vehicles','/vehicles',CarFront],['Active Session','/dashboard',Clock3],['Payment History','/receipts',ReceiptText],['Notifications','/dashboard',Bell],['Driver Profile','/profile',User]].map(([label,href,Icon]) => <Link href={String(href)} key={String(label)} style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #edf1f5", padding: "13px 4px", fontSize: 13, fontWeight: 800 }}>{typeof Icon === "function" ? <Icon size={17} color="#176b87" /> : null}{String(label)}</Link>)}
          </aside>
        </section>
      </main>
    </RoleGuard>
  );
}
