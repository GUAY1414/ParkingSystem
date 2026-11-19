import Link from "next/link";
import { ArrowLeft, ShieldCheck, UserCog } from "lucide-react";

const roles = ["DRIVER", "PARKING_ATTENDANT", "PARKING_ADMINISTRATOR", "SYSTEM_ADMINISTRATOR"];

export default function RoleManagementPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f4f7fa", padding: 24 }}>
      <div style={{ maxWidth: 900, margin: "auto" }}>
        <Link href="/dashboard" style={{ display: "flex", gap: 7, alignItems: "center", color: "#66758a", fontSize: 13, marginBottom: 12 }}><ArrowLeft size={15} /> Dashboard</Link>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><UserCog color="#176b87" /><h1 style={{ margin: 0 }}>Role management</h1></div>
        <p style={{ color: "#66758a", fontSize: 14 }}>System administrator access only.</p>
        <section style={{ background: "white", border: "1px solid #e7edf4", borderRadius: 14, padding: 18 }}>
          {roles.map((role) => <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #edf1f5", padding: "14px 4px" }}><span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13 }}><ShieldCheck size={16} color="#397261" />{role.replaceAll("_", " ")}</span><button className="secondary-button" type="button">Manage</button></div>)}
        </section>
      </div>
    </main>
  );
}
