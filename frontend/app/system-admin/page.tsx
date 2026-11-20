"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleGuard from "../../components/RoleGuard";
import { CarFront, LogOut, Settings, ShieldCheck, User, Users } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function SystemAdminDashboard() {
  const router = useRouter();
  const [counts, setCounts] = useState({ users: 0, admins: 0, events: 0 });

  useEffect(() => {
    async function loadCounts() {
      if (!supabase) return;
      const [users, admins, events] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).in("role", ["PARKING_ADMINISTRATOR", "SYSTEM_ADMINISTRATOR"]),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }),
      ]);
      setCounts({ users: users.count ?? 0, admins: admins.count ?? 0, events: events.count ?? 0 });
    }
    loadCounts();
  }, []);

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMINISTRATOR"]}>
      <main className="dashboard-layout">
        <aside className="sidebar">
          <Link href="/" className="brand"><span className="brand-mark"><CarFront size={18} /></span><span><strong>Kuya meron pa?</strong><small>System Administrator</small></span></Link>
          <nav className="sidebar-nav"><Link href="/system-admin"><Users size={17}/><span>Users & Roles</span></Link><Link href="/role-management"><Settings size={17}/><span>Configuration</span></Link><Link href="/system-admin"><ShieldCheck size={17}/><span>Security</span></Link><Link href="/profile"><User size={17}/><span>Profile</span></Link><button type="button" onClick={signOut} style={{ border: 0, background: "transparent", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", fontWeight: 700 }}><LogOut size={17}/><span>Sign out</span></button></nav>
        </aside>
        <section className="dashboard-main"><header className="dashboard-head"><div><h1>System Administration</h1><p>Users, roles, security, and system operations</p></div></header><div className="metric-grid"><article className="metric-card"><span>System users</span><strong>{counts.users}</strong><span>Registered profiles</span></article><article className="metric-card"><span>Administrators</span><strong>{counts.admins}</strong><span>Privileged personnel</span></article><article className="metric-card"><span>Audit events</span><strong>{counts.events}</strong><span>Recorded activity</span></article><article className="metric-card"><span>System status</span><strong>Live</strong><span>Supabase connected</span></article></div><div className="panel-grid"><section className="panel"><h2>Personnel</h2><div className="availability-row"><span>Create and invite parking administrators</span><Link href="/role-management"><strong>Manage personnel</strong></Link></div></section><section className="panel"><h2>Platform security</h2><div className="availability-row"><span>Role changes are recorded in audit logs</span><Link href="/system-admin"><strong>Protected by RLS</strong></Link></div></section></div></section>
      </main>
    </RoleGuard>
  );
}
