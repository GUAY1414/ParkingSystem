"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "../../components/RoleGuard";
import { CarFront, LogOut, MapPin, ReceiptText, Settings, User, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ParkingAdminDashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState({ locations: 0, sessions: 0, transactions: 0, attendants: 0 });

  useEffect(() => {
    async function loadCounts() {
      if (!supabase) return;
      const [locations, sessions, transactions, attendants] = await Promise.all([
        supabase.from("parking_locations").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
        supabase.from("parking_sessions").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
        supabase.from("transactions").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "PARKING_ATTENDANT"),
      ]);
      setCounts({
        locations: locations.count ?? 0,
        sessions: sessions.count ?? 0,
        transactions: transactions.count ?? 0,
        attendants: attendants.count ?? 0,
      });
    }
    loadCounts();
  }, []);

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  return (
    <RoleGuard allowedRoles={["PARKING_ADMINISTRATOR"]}>
      <main className="dashboard-layout">
        <aside className="sidebar">
          <Link href="/" className="brand"><span className="brand-mark"><CarFront size={18} /></span><span><strong>Kuya meron pa?</strong><small>Parking Administrator</small></span></Link>
          <nav className="sidebar-nav"><Link href="/parking-admin"><MapPin size={17}/><span>Locations</span></Link><Link href="/role-management"><Users size={17}/><span>Attendants</span></Link><Link href="/parking-admin"><ReceiptText size={17}/><span>Sessions & Payments</span></Link><Link href="/parking-admin"><Settings size={17}/><span>Reports</span></Link><Link href="/profile"><User size={17}/><span>Profile</span></Link><button type="button" onClick={signOut} style={{ border: 0, background: "transparent", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", fontWeight: 700 }}><LogOut size={17}/><span>Sign out</span></button></nav>
        </aside>
        <section className="dashboard-main"><header className="dashboard-head"><div><h1>Parking Administration</h1><p>Locations, zones, attendants, and operations</p></div></header><div className="metric-grid"><article className="metric-card"><span>Locations</span><strong>{counts.locations}</strong><span>Active parking locations</span></article><article className="metric-card"><span>Active sessions</span><strong>{counts.sessions}</strong><span>Currently parked</span></article><article className="metric-card"><span>Transactions</span><strong>{counts.transactions}</strong><span>All records</span></article><article className="metric-card"><span>Attendants</span><strong>{counts.attendants}</strong><span>Authorized personnel</span></article></div><div className="panel-grid"><section className="panel"><h2>Operations</h2><div className="availability-row"><span>Assign and invite attendants</span><Link href="/role-management"><strong>Manage users</strong></Link></div><div className="availability-row"><span>View locations and availability</span><Link href="/map"><strong>Open map</strong></Link></div></section><section className="panel"><h2>Reports</h2><div className="availability-row"><span>Receipts and payment records</span><Link href="/receipts"><strong>View reports</strong></Link></div></section></div></section>
      </main>
    </RoleGuard>
  );
}
