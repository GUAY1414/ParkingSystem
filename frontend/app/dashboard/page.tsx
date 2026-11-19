import Link from "next/link";
import { CarFront, LayoutDashboard, MapPin, ReceiptText, Search, Settings, Users } from "lucide-react";

const metrics = [
  ["Active sessions", "—"],
  ["Registered drivers", "—"],
  ["Registered vehicles", "—"],
  ["Recorded transactions", "—"],
];

export default function DashboardPage() {
  return (
    <main className="dashboard-layout">
      <aside className="sidebar">
        <Link href="/" className="brand"><span className="brand-mark"><CarFront size={18} /></span><span><strong>Kuya meron pa?</strong><small>Parking admin</small></span></Link>
        <nav className="sidebar-nav">
          <Link href="/dashboard"><LayoutDashboard size={17} /><span>Overview</span></Link>
          <Link href="/map"><MapPin size={17} /><span>Locations</span></Link>
          <Link href="/dashboard"><Users size={17} /><span>Users</span></Link>
          <Link href="/dashboard"><ReceiptText size={17} /><span>Transactions</span></Link>
          <Link href="/dashboard"><Settings size={17} /><span>Settings</span></Link>
        </nav>
        <div className="sidebar-footer">Database connection required</div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-head">
          <div><h1>Administrator overview</h1><p>Live statistics from the parking database</p></div>
          <button className="primary-button" type="button"><Search size={15} /> Search</button>
        </header>

        <div className="metric-grid">
          {metrics.map(([label, value]) => (
            <article className="metric-card" key={label}><span>{label}</span><strong>{value}</strong><span>Pending database connection</span></article>
          ))}
        </div>

        <div className="panel-grid">
          <section className="panel">
            <h2>Recent parking sessions</h2>
            <div className="availability-row"><span>No session data available</span><strong>Connect Supabase</strong></div>
          </section>

          <section className="panel">
            <h2>Parking availability</h2>
            <div className="availability-row"><span>No location data available</span><strong>Connect Supabase</strong></div>
          </section>
        </div>
      </section>
    </main>
  );
}
