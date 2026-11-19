"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { supabase } from "../../lib/supabase";

type Receipt = { id: string; receipt_number: string; issued_at: string };

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailStatus, setEmailStatus] = useState("");

  async function emailReceipt(receiptId: string) {
    setEmailStatus("");
    if (!supabase) {
      setEmailStatus("Supabase configuration is missing.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setEmailStatus("Sign in to email this receipt.");
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/notifications/receipts/${receiptId}/email`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await response.json();

    if (!response.ok) setEmailStatus(body.error?.message ?? "Could not send receipt email.");
    else if (body.data?.sent) setEmailStatus("Receipt email sent.");
    else setEmailStatus("Email provider is not configured; receipt remains available here.");
  }

  useEffect(() => {
    async function loadReceipts() {
      if (!supabase) {
        setError("Supabase configuration is missing.");
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError("Sign in to view receipts.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"}/transactions/receipts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();

      if (!response.ok) setError(body.error?.message ?? "Could not retrieve receipts.");
      else setReceipts(body.data ?? []);
      setLoading(false);
    }

    loadReceipts();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "auto" }}>
        <Link href="/dashboard" style={{ display: "flex", gap: 7, alignItems: "center", color: "#66758a", fontSize: 13, marginBottom: 12 }}><ArrowLeft size={15} /> Dashboard</Link>
        <h1 style={{ marginTop: 0 }}>Digital receipts</h1>
        <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, minHeight: 300, padding: 18 }}>
          {loading ? (
            <div style={{ minHeight: 264, display: "grid", placeItems: "center", color: "#66758a" }}>Loading receipts…</div>
          ) : error ? (
            <div style={{ minHeight: 264, display: "grid", placeItems: "center", color: "#b42318", textAlign: "center" }}>{error}</div>
          ) : receipts.length === 0 ? (
            <div style={{ minHeight: 264, display: "grid", placeItems: "center", textAlign: "center" }}><div><ReceiptText size={40} color="#176b87" style={{ margin: "auto" }} /><strong style={{ display: "block", marginTop: 12 }}>No confirmed receipts</strong><span style={{ color: "#66758a", fontSize: 13 }}>Receipts appear after a verified payment.</span></div></div>
          ) : (
            receipts.map((receipt) => (
              <article key={receipt.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #edf1f5", padding: "14px 4px" }}>
                <div><strong style={{ display: "block" }}>{receipt.receipt_number}</strong><small style={{ color: "#66758a" }}>Issued {new Date(receipt.issued_at).toLocaleString()}</small></div>
                <button className="secondary-button" type="button" onClick={() => emailReceipt(receipt.id)}>Email receipt</button>
              </article>
            ))
          )}
          {emailStatus && <p style={{ color: "#66758a", fontSize: 12, textAlign: "right", marginTop: 12 }}>{emailStatus}</p>}
        </section>
      </div>
    </main>
  );
}
