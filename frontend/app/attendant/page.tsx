"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { CarFront, LayoutDashboard, LogOut, MapPin, ReceiptText, ScanLine } from "lucide-react";
import { supabase } from "../../lib/supabase";
import RoleGuard from "../../components/RoleGuard";

const Scanner = dynamic(() => import("../../components/parking/CameraPlateScanner"), { ssr: false });

export default function AttendantPage() {
  const [reference, setReference] = useState("");
  const [sessionResult, setSessionResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyReference() {
    setError("");
    setSessionResult(null);
    setLoading(true);

    if (!supabase) {
      setError("Supabase configuration is missing.");
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("Sign in as an authorized attendant.");
      setLoading(false);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/qr/session/${encodeURIComponent(reference.trim())}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(body.error?.message ?? "Could not verify QR reference.");
      return;
    }

    setSessionResult(body.data);
  }

  return (
    <RoleGuard allowedRoles={["PARKING_ATTENDANT"]}>
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
          <section className="panel">
            <h2>Verify parking session</h2>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Secure session reference</label>
            <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="KMP-..." style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px" }} />
            <button type="button" className="primary-button" onClick={verifyReference} disabled={loading || !reference.trim()} style={{ width: "100%", marginTop: 10, border: 0 }}>{loading ? "Verifying…" : "Verify QR reference"}</button>
            {error && <p role="alert" style={{ color: "#b42318", background: "#fff1f0", borderRadius: 8, padding: 10, fontSize: 12 }}>{error}</p>}
            {sessionResult && <pre style={{ marginTop: 12, padding: 12, background: "#f4f7fa", borderRadius: 8, fontSize: 11, overflowX: "auto" }}>{JSON.stringify(sessionResult, null, 2)}</pre>}
          </section>
        </div>
      </section>
    </main>
    </RoleGuard>
  );
}
