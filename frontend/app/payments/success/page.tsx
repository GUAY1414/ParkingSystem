import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f7fa", padding: 20 }}>
      <section style={{ width: "100%", maxWidth: 440, background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 32, textAlign: "center" }}>
        <CheckCircle2 size={48} color="#397261" style={{ margin: "auto" }} />
        <h1>Payment submitted</h1>
        <p style={{ color: "#66758a", lineHeight: 1.6 }}>The provider has been notified. The system will confirm payment only after server-side verification.</p>
        <Link href="/dashboard" className="primary-button">Return to dashboard</Link>
      </section>
    </main>
  );
}
