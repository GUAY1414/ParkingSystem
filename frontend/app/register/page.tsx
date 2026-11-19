"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, CarFront, LockKeyhole, Mail, User } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!supabase) {
      setError("Supabase configuration is missing.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess("Account created. Check your email if confirmation is enabled, then sign in.");
    setLoading(false);
  }

  const fieldStyle = { display: "flex", alignItems: "center", gap: 8, height: 46, border: "1px solid #e1e7ee", borderRadius: 9, padding: "0 12px", marginBottom: 14 };
  const inputStyle = { border: 0, outline: 0, width: "100%" };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#eef3f6" }}>
      <section style={{ width: "100%", maxWidth: 440, background: "white", border: "1px solid #e7edf4", borderRadius: 18, padding: 28, boxShadow: "0 24px 60px rgba(16,35,63,.10)" }}>
        <Link href="/" className="brand" style={{ marginBottom: 28 }}><span className="brand-mark"><CarFront size={19} /></span><span><strong>Kuya meron pa?</strong><small>Driver registration</small></span></Link>
        <h1 style={{ margin: "0 0 6px", fontSize: 28 }}>Create your account</h1>
        <p style={{ margin: "0 0 24px", color: "#66758a", fontSize: 14 }}>Register as a driver.</p>
        <form onSubmit={submitRegistration}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>First name</label>
          <div style={fieldStyle}><User size={16} color="#75849a" /><input required value={firstName} onChange={(event) => setFirstName(event.target.value)} aria-label="First name" style={inputStyle} /></div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Last name</label>
          <div style={fieldStyle}><User size={16} color="#75849a" /><input required value={lastName} onChange={(event) => setLastName(event.target.value)} aria-label="Last name" style={inputStyle} /></div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Email address</label>
          <div style={fieldStyle}><Mail size={16} color="#75849a" /><input required value={email} onChange={(event) => setEmail(event.target.value)} type="email" aria-label="Email address" style={inputStyle} /></div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 800, marginBottom: 7 }}>Password</label>
          <div style={fieldStyle}><LockKeyhole size={16} color="#75849a" /><input required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} type="password" aria-label="Password" style={inputStyle} /></div>
          {error && <p role="alert" style={{ color: "#b42318", background: "#fff1f0", borderRadius: 8, padding: 10, fontSize: 12 }}>{error}</p>}
          {success && <p role="status" style={{ color: "#397261", background: "#dff3ee", borderRadius: 8, padding: 10, fontSize: 12 }}>{success}</p>}
          <button className="primary-button" type="submit" disabled={loading} style={{ width: "100%", height: 48, marginTop: 4, border: 0 }}>{loading ? "Creating account…" : "Create account"} <ArrowRight size={16} /></button>
        </form>
        <p style={{ textAlign: "center", margin: "18px 0 0", color: "#66758a", fontSize: 12 }}>Already have an account? <Link href="/login" style={{ color: "#176b87", fontWeight: 800 }}>Sign in</Link></p>
      </section>
    </main>
  );
}
