"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, CarFront, LockKeyhole, Mail } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!supabase) {
      setError("Supabase configuration is missing.");
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const role = profile?.role;
    window.location.href = role === "PARKING_ATTENDANT" ? "/attendant" : role === "PARKING_ADMINISTRATOR" || role === "SYSTEM_ADMINISTRATOR" ? "/dashboard" : "/dashboard";
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#eef3f6" }}>
      <section style={{ width: "100%", maxWidth: 410, background: "white", border: "1px solid #e7edf4", borderRadius: 18, padding: 28, boxShadow: "0 24px 60px rgba(16,35,63,.10)" }}>
        <Link href="/" className="brand" style={{ marginBottom: 28 }}>
          <span className="brand-mark"><CarFront size={19} /></span>
          <span><strong>Kuya meron pa?</strong><small>Digital Parking Manila</small></span>
        </Link>
        <h1 style={{ margin: "0 0 6px", fontSize: 28 }}>Welcome back</h1>
        <p style={{ margin: "0 0 24px", color: "#66758a", fontSize: 14 }}>Sign in to your authorized workspace.</p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Email address</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 46, border: "1px solid #e1e7ee", borderRadius: 9, padding: "0 12px", marginBottom: 14 }}><Mail size={16} color="#75849a" /><input required value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email address" type="email" placeholder="name@example.com" style={{ border: 0, outline: 0, width: "100%" }} /></div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Password</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 46, border: "1px solid #e1e7ee", borderRadius: 9, padding: "0 12px" }}><LockKeyhole size={16} color="#75849a" /><input required value={password} onChange={(event) => setPassword(event.target.value)} aria-label="Password" type="password" placeholder="Enter password" style={{ border: 0, outline: 0, width: "100%" }} /></div>
          {error && <p role="alert" style={{ color: "#b42318", background: "#fff1f0", borderRadius: 8, padding: 10, fontSize: 12 }}>{error}</p>}
          <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%", height: 48, marginTop: 18, border: 0 }}>{loading ? "Signing in…" : "Sign in"} <ArrowRight size={16} /></button>
        </form>
        <p style={{ textAlign: "center", margin: "18px 0 0", color: "#66758a", fontSize: 12 }}>No account? <Link href="/register" style={{ color: "#176b87", fontWeight: 800 }}>Register as a driver</Link></p>
      </section>
    </main>
  );
}
