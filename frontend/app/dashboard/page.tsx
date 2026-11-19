"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, LayoutDashboard, LogOut, MapPin, ReceiptText, Settings, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Profile = { role: string; first_name: string | null; last_name: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);
  const [locationCount, setLocationCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!supabase) return;
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) {
        router.replace("/login");
        return;
      }

      const [{ data: profileData }, { count: vehicles }, { count: locations }] = await Promise.all([
        supabase.from("profiles").select("role,first_name,last_name").eq("id", userId).maybeSingle(),
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("owner_id", userId),
        supabase.from("parking_locations").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
      ]);

      const role = (profileData as Profile | null)?.role;
      if (role === "PARKING_ATTENDANT") {
        router.replace("/attendant");
        return;
      }
      if (role === "PARKING_ADMINISTRATOR") {
        router.replace("/parking-admin");
        return;
      }
      if (role === "SYSTEM_ADMINISTRATOR") {
        router.replace("/system-admin");
        return;
      }
      router.replace("/driver");

      setProfile(profileData as Profile | null);
      setVehicleCount(vehicles ?? 0);
      setLocationCount(locations ?? 0);
    }
    loadDashboard();
  }, [router]);

  async function signOut() {
    await supabase?.auth.signOut();
    router.push("/login");
  }

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Driver";
  const isAttendant = profile?.role === "PARKING_ATTENDANT";
  const isAdmin = profile?.role === "PARKING_ADMINISTRATOR" || profile?.role === "SYSTEM_ADMINISTRATOR";

  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <Link href="/" className="brand"><span className="brand-mark"><CarFront size={18} /></span><span><strong>Kuya meron pa?</strong><small>{profile?.role?.replaceAll("_", " ").toLowerCase() || "workspace"}</small></span></Link>
        <nav className="sidebar-nav">
          <Link href="/dashboard"><LayoutDashboard size={17} /><span>Overview</span></Link>
          <Link href="/vehicles"><CarFront size={17} /><span>Vehicles</span></Link>
          <Link href="/map"><MapPin size={17} /><span>Map</span></Link>
          {isAdmin && <Link href="/role-management"><Users size={17} /><span>Users</span></Link>}
          {isAttendant && <Link href="/attendant"><ReceiptText size={17} /><span>Sessions</span></Link>}
          {isAdmin && <Link href="/dashboard"><Settings size={17} /><span>Settings</span></Link>}
          <button type="button" onClick={signOut} style={{ border: 0, background: "transparent", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", fontWeight: 700 }}><LogOut size={17} /><span>Sign out</span></button>
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-head">
          <div><h1>Good day, {name}</h1><p>{profile?.role?.replaceAll("_", " ") || "Loading profile"}</p></div>
        </header>

        <div className="metric-grid">
          <article className="metric-card"><span>Registered vehicles</span><strong>{vehicleCount ?? "—"}</strong><span>Driver account</span></article>
          <article className="metric-card"><span>Active locations</span><strong>{locationCount ?? "—"}</strong><span>Across Manila</span></article>
          <article className="metric-card"><span>Active sessions</span><strong>—</strong><span>Awaiting session data</span></article>
          <article className="metric-card"><span>Transactions</span><strong>—</strong><span>Awaiting payment data</span></article>
        </div>

        <div className="panel-grid">
          <section className="panel">
            <h2>Recent parking sessions</h2>
            <div className="availability-row"><span>No session data available</span><strong>Check back after a session</strong></div>
          </section>
          <section className="panel">
            <h2>Parking availability</h2>
            <div className="availability-row"><span>View live locations and zones</span><Link href="/map"><strong>Open map</strong></Link></div>
          </section>
        </div>
      </section>
    </main>
  );
}
