"use client";
import { useState } from "react";
export default function AccountLogin() {
  const [st, setSt] = useState("idle"), [err, setErr] = useState("");
  async function go(e) { e.preventDefault(); setSt("sending"); setErr(""); const r = await fetch("/api/account/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.target))) }); if (r.ok) setSt("sent"); else { setSt("idle"); setErr((await r.json()).error); } }
  if (st === "sent") return <p role="status"><strong>Check your inbox.</strong> If we have an order under that email, we have sent a sign-in link. It works for 15 minutes.</p>;
  return (<form className="f" onSubmit={go}><label>Email address<input name="email" type="email" required autoComplete="email" /></label>{err && <p role="alert">{err}</p>}<button className="btn" disabled={st === "sending"}>{st === "sending" ? "Sending…" : "Email me a sign-in link"}</button><p className="note">No password needed. You can also check out as a guest at any time.</p></form>);
}
