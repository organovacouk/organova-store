"use client";
import { useEffect, useState } from "react";
export default function RefBanner() {
  const [info, setInfo] = useState(null), [done, setDone] = useState("");
  useEffect(() => {
    const code = new URLSearchParams(location.search).get("ref");
    if (!code || !/^[A-Za-z0-9]{3,20}$/.test(code)) return;
    fetch("/api/aff/ref?code=" + code).then((r) => r.json()).then((j) => j.code && setInfo(j)).catch(() => {});
  }, []);
  const clean = () => { const u = new URL(location.href); u.searchParams.delete("ref"); history.replaceState(null, "", u.pathname + u.search); };
  async function allow() { const r = await fetch("/api/aff/consent", { method: "POST", body: JSON.stringify({ code: info.code }) }); clean(); setInfo(null); setDone(r.ok ? (info.percent ? `Done. Your ${info.percent}% partner discount will be applied at checkout.` : "Done. Thank you.") : ""); setTimeout(() => setDone(""), 6000); }
  if (done) return <div className="refbar" role="status">{done}</div>;
  if (!info) return null;
  return (
    <div className="refbar" role="dialog" aria-label="Partner offer">
      <p>{info.percent ? <b>{info.percent}% off with a partner offer. </b> : null}An Organova partner sent you here. May we set a cookie for 30 days so they get credit{info.percent ? " and your discount applies automatically" : ""}? You can still shop either way.</p>
      <div><button className="btn sm" onClick={allow}>Allow</button><button className="btn ghost sm" onClick={() => { clean(); setInfo(null); }}>No thanks</button></div>
    </div>
  );
}
