"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CarFront, LayoutDashboard, LogOut, MapPin, Printer, ReceiptText, ScanLine, User } from "lucide-react";
import { supabase } from "../../lib/supabase";
import RoleGuard from "../../components/RoleGuard";

const Scanner = dynamic(() => import("../../components/parking/CameraPlateScanner"), { ssr: false });

export default function AttendantPage() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [sessionResult, setSessionResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [zoneId, setZoneId] = useState("");
  const [vehicle, setVehicle] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [qrImage, setQrImage] = useState("");
  const [receipt, setReceipt] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState("");

  useEffect(() => {
    async function loadLocations() {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/parking/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (response.ok) setLocations(body.data ?? []);
    }
    loadLocations();
  }, []);

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/login");
  }

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
    setActiveSession(body.data);
  }

  async function lookupVehicle(plate: string) {
    setError("");
    setPaymentStatus("");
    setReceipt(null);
    setActiveSession(null);
    setQrImage("");

    if (!supabase) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("Sign in as an authorized attendant.");
      return;
    }

    const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/vehicles/lookup?plate=${encodeURIComponent(normalized)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error?.message ?? "Could not look up vehicle.");
      return;
    }
    if (!body.data) {
      setError("Vehicle is not registered.");
      setVehicle(null);
      return;
    }
    setVehicle(body.data);
  }

  async function startSession() {
    setError("");
    setPaymentStatus("");
    setReceipt(null);
    if (!vehicle || !zoneId) {
      setError("Select a zone and confirm a registered vehicle.");
      return;
    }
    setLoading(true);
    if (!supabase) {
      setError("Supabase configuration is missing.");
      setLoading(false);
      return;
    }
    const sessionData = await supabase.auth.getSession();
    const token = sessionData.data.session?.access_token;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/parking/sessions/by-plate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plateNumber: vehicle.plate_number, zoneId }),
    });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(body.error?.message ?? "Could not start parking session.");
      return;
    }
    setActiveSession(body.data);
    setSessionResult(body.data);
    setQrImage(await QRCode.toDataURL(body.data.qr_reference));
  }

  async function settleSession(paymentMethod: "CASH" | "QR") {
    if (!activeSession?.id) {
      setError("Start or verify an active session first.");
      return;
    }
    setLoading(true);
    setError("");
    setPaymentStatus("");
    if (!supabase) {
      setError("Supabase configuration is missing.");
      setLoading(false);
      return;
    }
    const sessionData = await supabase.auth.getSession();
    const token = sessionData.data.session?.access_token;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/transactions/settle`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId: activeSession.id, paymentMethod, amountCentavos: activeSession.snapshot_rate_centavos }),
    });
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(body.error?.message ?? "Could not settle payment.");
      return;
    }
    setReceipt(body.data.receipt);
    setPaymentStatus(body.data.discrepancy ? "Payment discrepancy recorded." : `${paymentMethod} payment confirmed. Session closed.`);
  }

  function printReceipt() {
    if (!receipt) return;
    const printWindow = window.open("", "_blank", "width=420,height=700");
    if (!printWindow) return;
    const vehicleName = (activeSession as any)?.vehicles?.plate_number ?? vehicle?.plate_number ?? "N/A";
    printWindow.document.write(`<html><head><title>Parking Receipt</title><style>body{font-family:Arial;padding:24px}h1{font-size:18px}table{width:100%;border-collapse:collapse}td{padding:8px 0;border-bottom:1px solid #ddd}</style></head><body><h1>Kuya meron pa? Parking Receipt</h1><table><tr><td>Receipt</td><td>${receipt.receipt_number}</td></tr><tr><td>Plate</td><td>${vehicleName}</td></tr><tr><td>Amount</td><td>PHP ${(activeSession?.snapshot_rate_centavos / 100).toFixed(2)}</td></tr><tr><td>Issued</td><td>${new Date(receipt.issued_at).toLocaleString()}</td></tr></table><script>window.onload=()=>window.print()<\\/script></body></html>`);
    printWindow.document.close();
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
          <Link href="/profile"><User size={17} /><span>Profile</span></Link>
          <button type="button" onClick={signOut} style={{ border: 0, background: "transparent", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", fontWeight: 700 }}><LogOut size={17} /><span>Sign out</span></button>
        </nav>
      </aside>
      <section className="dashboard-main">
        <header className="dashboard-head"><div><h1>Attendant workspace</h1><p>Plate scan and parking session control</p></div><span className="badge">Authorized access</span></header>
        <div className="panel-grid">
          <section className="panel"><h2>Vehicle scanner</h2><Scanner onPlateConfirmed={lookupVehicle} />
            {vehicle && <div style={{ marginTop: 12, padding: 12, background: "#eef8f5", borderRadius: 8 }}><strong>{vehicle.plate_number}</strong><div style={{ color: "#66758a", fontSize: 12 }}>{vehicle.make ?? "Vehicle"} · {vehicle.color ?? "No color"}</div></div>}
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginTop: 12 }}>Parking zone</label>
            <select value={zoneId} onChange={(event) => setZoneId(event.target.value)} style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px", marginTop: 7 }}>
              <option value="">Select parking zone</option>
              {locations.flatMap((location) => (location.parking_zones ?? []).map((zone: any) => <option key={zone.id} value={zone.id}>{location.name} — {zone.name} ({zone.capacity - zone.occupancy} available)</option>))}
            </select>
            <button type="button" className="primary-button" onClick={startSession} disabled={loading || !vehicle || !zoneId} style={{ width: "100%", marginTop: 10, border: 0 }}>{loading ? "Starting…" : "Start parking session"}</button>
          </section>
          <section className="panel">
            <h2>Verify parking session</h2>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Secure session reference</label>
            <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="KMP-..." style={{ width: "100%", height: 44, border: "1px solid #dde5ed", borderRadius: 9, padding: "0 10px" }} />
            <button type="button" className="primary-button" onClick={verifyReference} disabled={loading || !reference.trim()} style={{ width: "100%", marginTop: 10, border: 0 }}>{loading ? "Verifying…" : "Verify QR reference"}</button>
            {error && <p role="alert" style={{ color: "#b42318", background: "#fff1f0", borderRadius: 8, padding: 10, fontSize: 12 }}>{error}</p>}
            {sessionResult && <pre style={{ marginTop: 12, padding: 12, background: "#f4f7fa", borderRadius: 8, fontSize: 11, overflowX: "auto" }}>{JSON.stringify(sessionResult, null, 2)}</pre>}
            {activeSession && (
              <div style={{ marginTop: 12, padding: 12, border: "1px solid #e7edf4", borderRadius: 10 }}>
                <strong>Active session</strong>
                <p style={{ fontSize: 12, color: "#66758a" }}>{activeSession.qr_reference}</p>
                {qrImage && <img src={qrImage} alt="Parking session QR" style={{ width: 160, height: 160, display: "block", margin: "8px auto" }} />}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                  <button type="button" className="primary-button" onClick={() => settleSession("CASH")} disabled={loading}>End & Cash</button>
                  <button type="button" className="secondary-button" onClick={() => settleSession("QR")} disabled={loading}>End & QR</button>
                </div>
              </div>
            )}
            {paymentStatus && <p role="status" style={{ color: "#397261", background: "#dff3ee", borderRadius: 8, padding: 10, fontSize: 12 }}>{paymentStatus}</p>}
            {receipt && <button type="button" className="secondary-button" onClick={printReceipt} style={{ width: "100%", marginTop: 8 }}><Printer size={16} /> Print receipt</button>}
          </section>
        </div>
      </section>
    </main>
    </RoleGuard>
  );
}
