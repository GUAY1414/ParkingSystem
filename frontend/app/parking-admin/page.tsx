"use client";

import Link from "next/link";
import RoleGuard from "../../components/RoleGuard";
import { CarFront, MapPin, ReceiptText, Settings, Users } from "lucide-react";

export default function ParkingAdminDashboard() {
  return (
    <RoleGuard allowedRoles={["PARKING_ADMINISTRATOR"]}>
      <main className="dashboard-layout">
        <aside className="sidebar">
          <Link href="/" className="brand"><span className="brand-mark"><CarFront size={18} /></span><span><strong>Kuya meron pa?</strong><small>Parking Administrator</small></span></Link>
          <nav className="sidebar-nav"><Link href="/parking-admin"><MapPin size={17}/><span>Locations</span></Link><Link href="/role-management"><Users size={17}/><span>Attendants</span></Link><Link href="/parking-admin"><ReceiptText size={17}/><span>Sessions & Payments</span></Link><Link href="/parking-admin"><Settings size={17}/><span>Reports</span></Link></nav>
        </aside>
        <section className="dashboard-main"><header className="dashboard-head"><div><h1>Parking Administration</h1><p>Locations, zones, attendants, and operations</p></div></header><div className="metric-grid"><article className="metric-card"><span>Locations</span><strong>—</strong><span>Database required</span></article><article className="metric-card"><span>Active sessions</span><strong>—</strong><span>Live data</span></article><article className="metric-card"><span>Transactions</span><strong>—</strong><span>Live data</span></article><article className="metric-card"><span>Discrepancies</span><strong>—</strong><span>Review queue</span></article></div></section>
      </main>
    </RoleGuard>
  );
}
