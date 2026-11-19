"use client";

import Link from "next/link";
import RoleGuard from "../../components/RoleGuard";
import { CarFront, Settings, ShieldCheck, Users } from "lucide-react";

export default function SystemAdminDashboard() {
  return (
    <RoleGuard allowedRoles={["SYSTEM_ADMINISTRATOR"]}>
      <main className="dashboard-layout">
        <aside className="sidebar">
          <Link href="/" className="brand"><span className="brand-mark"><CarFront size={18} /></span><span><strong>Kuya meron pa?</strong><small>System Administrator</small></span></Link>
          <nav className="sidebar-nav"><Link href="/system-admin"><Users size={17}/><span>Users & Roles</span></Link><Link href="/system-admin"><Settings size={17}/><span>Configuration</span></Link><Link href="/system-admin"><ShieldCheck size={17}/><span>Security</span></Link></nav>
        </aside>
        <section className="dashboard-main"><header className="dashboard-head"><div><h1>System Administration</h1><p>Users, roles, security, and system operations</p></div></header><div className="metric-grid"><article className="metric-card"><span>System users</span><strong>—</strong><span>Live data</span></article><article className="metric-card"><span>Role changes</span><strong>—</strong><span>Audit log</span></article><article className="metric-card"><span>Security events</span><strong>—</strong><span>Audit log</span></article><article className="metric-card"><span>System status</span><strong>—</strong><span>Operational</span></article></div></section>
      </main>
    </RoleGuard>
  );
}
