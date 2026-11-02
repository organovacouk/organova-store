"use client";
import { useState } from "react";
export default function PasswordForm({ hasPassword }) {
  const [st, setSt] = useState(""), [err, setErr] = useState(""), [has, setHas] = useState(hasPassword);
  async function save(e) {
    e.preventDefault(); setSt("saving"); setErr(""); const form = e.target;
    const r = await fetch("/api/account/password-set", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); const j = await r.json();
    if (r.ok) { setSt("saved"); setHas(true); form.reset(); } else { setSt(""); setErr(j.error || "Could not save."); }
  }
  return (
    <form className="f" onSubmit={save} style={{ marginBottom: 24 }}>
      {has && <label>Current password <span className="h" style={{ fontWeight: 400 }}>(not needed if you signed in within the last 30 minutes)</span><input name="current" type="password" autoComplete="current-password" /></label>}
      <label>{has ? "New password" : "Choose a password"}<input name="password" type="password" required minLength="10" autoComplete="new-password" /></label>
      <p className="note" style={{ margin: 0 }}>At least 10 characters. We check it against known data breaches without ever sending the password itself.</p>
      {err && <p role="alert">{err}</p>}
      <div><button className="btn sm" disabled={st === "saving"}>{st === "saving" ? "Saving…" : has ? "Change password" : "Set password"}</button> {st === "saved" && <span role="status">Password saved. You can now sign in with it.</span>}</div>
    </form>
  );
}
