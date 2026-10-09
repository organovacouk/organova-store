"use client";
import { useState } from "react";
export default function Newsletter() {
  const [st, setSt] = useState("idle");
  async function go(e) { e.preventDefault(); setSt("sending"); const r = await fetch("/api/subscribe", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.target))) }); setSt(r.ok ? "sent" : "err"); }
  if (st === "sent") return <p role="status">You are on the list. Thank you.</p>;
  return (<form className="nl" onSubmit={go}><input name="email" type="email" required placeholder="Your email address" aria-label="Email address" /><input className="hp" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" /><button className="btn">Subscribe</button>{st === "err" && <small role="alert">Please check your email address.</small>}</form>);
}
