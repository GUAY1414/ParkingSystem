"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { CarFront, LayoutDashboard, LogOut, MapPin, ReceiptText, ScanLine } from "lucide-react";

const Scanner = dynamic(() => import("../../components/parking/CameraPlateScanner"), { ssr: false });

export default function AttendantPage() {
  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <Link href="/" className="brand"><span className="brand-mark"><CarFront size={18} /></span><span><strong>Kuya meron pa?</strong><small>Attendant</small></span></Link>
        <nav className="sidebar-nav">
          <Link href="/attendant"><LayoutDashboard size={17} /><span>Overview</span></Link>
          <Link href="/attendant"><ScanLine size={17} /><span>Scan vehicle</span></Link>
          <Link href="/map"><MapPin size={17} /><span>Assigned zones</span></Link>
          <Link href="/attendant"><ReceiptText size={17} /><span>Transactions</span></Link>
          <Link href="/"><LogOut size={17} /><span>Sign out</span></Link>
        </nav>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-head"><div><h1>Attendant workspace</h1><p>Plate scan and parking session control</p></div><span className="badge">Authorized access</span></header>
        <div className="panel-grid">
          <section className="panel"><h2>Vehicle scanner</h2><Scanner onPlateConfirmed={(plate) => alert(`Plate confirmed: ${plate}. Supabase vehicle lookup is required for verification.`)} /></section>
          <section className="panel"><h2>Assigned zones</h2><div className="availability-row"><span>Ermita Main · Zone A</span><strong>— available</strong></div><div className="availability-row"><span>Ermita Main · Zone B</span><strong>— available</strong></div><div style={{ marginTop: 18, color: "#66758a", fontSize: 12 }}>Zone data appears after Supabase configuration and attendant assignment.</div></section>
        </div>
      </section>
    </main>
  );
}
