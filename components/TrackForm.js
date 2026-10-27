"use client";
import { useState } from "react";
import TrackView from "./TrackView";
export default function TrackForm() {
  const [v, setV] = useState(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr(""); setV(null);
    const r = await fetch("/api/track", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.target))) }); const j = await r.json(); setBusy(false);
    if (r.ok) setV(j); else setErr(j.error || "Something went wrong.");
  }
  return (<>
    <form className="f" onSubmit={go}><label>Order number<input name="order" required placeholder="e.g. 1042" inputMode="numeric" /></label><label>Email used for the order<input name="email" type="email" required autoComplete="email" /></label>
      {err && <p role="alert">{err}</p>}<button className="btn" disabled={busy}>{busy ? "Looking…" : "Track order"}</button></form>
    {v && <TrackView v={v} />}</>);
}
