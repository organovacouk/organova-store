"use client";
import { useState } from "react";
export default function ProfileForm({ name, marketing }) {
  const [n, setN] = useState(name || ""), [m, setM] = useState(!!marketing), [st, setSt] = useState("");
  async function save(e) { e.preventDefault(); setSt("saving"); const r = await fetch("/api/account/profile", { method: "POST", body: JSON.stringify({ name: n, marketing: m }) }); setSt(r.ok ? "saved" : "error"); }
  return (
    <form className="f" onSubmit={save} style={{ marginBottom: 24 }}>
      <label>Your name<input value={n} onChange={(e) => setN(e.target.value)} maxLength="80" autoComplete="name" /></label>
      <label className="sw" style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 400 }}><input type="checkbox" checked={m} onChange={(e) => setM(e.target.checked)} style={{ width: 18 }} /> Send me new arrivals and tips by email (unsubscribe any time)</label>
      <div><button className="btn sm" disabled={st === "saving"}>{st === "saving" ? "Saving…" : "Save details"}</button> {st === "saved" && <span role="status">Saved.</span>}{st === "error" && <span role="alert">Could not save.</span>}</div>
    </form>
  );
}
