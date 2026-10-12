"use client";
import { useState } from "react";
export default function ApplyForm() {
  const [st, setSt] = useState("idle"), [err, setErr] = useState("");
  async function go(e) {
    e.preventDefault(); setSt("sending"); setErr("");
    const f = Object.fromEntries(new FormData(e.target)); f.terms = !!f.terms;
    const r = await fetch("/api/aff/apply", { method: "POST", body: JSON.stringify(f) });
    if (r.ok) setSt("sent"); else { setSt("idle"); setErr((await r.json()).error || "Something went wrong."); }
  }
  if (st === "sent") return <div className="doc" role="status"><h2>Thank you, we have your application</h2><p>We review applications within a few working days. If approved, we will email you a private link to your partner dashboard with your tracking link and personal discount code.</p></div>;
  return (
    <form className="f" onSubmit={go} style={{ maxWidth: 620 }}>
      <label>Your name<input name="name" required autoComplete="name" /></label>
      <label>Email<input name="email" type="email" required autoComplete="email" /></label>
      <label>Website, blog or social profile<input name="website" required placeholder="https://instagram.com/yourname" /></label>
      <label>How will you share Organova?<textarea name="promo" rows="4" required minLength="20" placeholder="e.g. Home organisation reels on Instagram, a blog about small flats, a newsletter…" /></label>
      <label>PayPal email for payouts<input name="payout_email" type="email" required /></label>
      <label className="sw" style={{ display: "flex", gap: 10, alignItems: "flex-start", fontWeight: 400 }}><input type="checkbox" name="terms" style={{ width: 18, marginTop: 4 }} /> <span>I have read and accept the <a href="/partners/terms" target="_blank">partner terms</a>, including the rule to clearly label content as advertising.</span></label>
      <input className="hp" name="website_hp" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      {err && <p role="alert"><b>{err}</b></p>}
      <button className="btn" disabled={st === "sending"}>{st === "sending" ? "Sending…" : "Apply to join"}</button>
    </form>
  );
}
