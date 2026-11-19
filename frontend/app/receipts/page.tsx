import Link from "next/link";
import { ArrowLeft, ReceiptText } from "lucide-react";

export default function ReceiptsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "auto" }}>
        <Link href="/dashboard" style={{ display: "flex", gap: 7, alignItems: "center", color: "#66758a", fontSize: 13, marginBottom: 12 }}><ArrowLeft size={15} /> Dashboard</Link>
        <h1 style={{ marginTop: 0 }}>Digital receipts</h1>
        <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, minHeight: 300, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div><ReceiptText size={40} color="#176b87" style={{ margin: "auto" }} /><strong style={{ display: "block", marginTop: 12 }}>No confirmed receipts</strong><span style={{ color: "#66758a", fontSize: 13 }}>Receipts appear after a verified payment.</span></div>
        </section>
      </div>
    </main>
  );
}
