import Link from "next/link";
import { CircleAlert } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f7fa", padding: 20 }}>
      <section style={{ width: "100%", maxWidth: 440, background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 32, textAlign: "center" }}>
        <CircleAlert size={48} color="#b42318" style={{ margin: "auto" }} />
        <h1>Payment cancelled</h1>
        <p style={{ color: "#66758a", lineHeight: 1.6 }}>No payment should be recorded unless PayMongo is confirmed through a verified server event.</p>
        <Link href="/dashboard" className="primary-button">Return to dashboard</Link>
      </section>
    </main>
  );
}
