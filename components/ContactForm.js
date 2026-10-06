"use client";
import { useState } from "react";
export default function ContactForm() {
  const [state, setState] = useState("idle"); const [err, setErr] = useState("");
  async function send(e) {
    e.preventDefault(); setState("sending"); setErr("");
    const f = Object.fromEntries(new FormData(e.target));
    const r = await fetch("/api/contact", { method: "POST", body: JSON.stringify(f) });
    if (r.ok) setState("sent"); else { setState("idle"); setErr((await r.json()).error || "Something went wrong. Please try again."); }
  }
  if (state === "sent") return <p role="status"><strong>Thank you.</strong> We have your message and will reply within 24–48 hours, Monday to Friday.</p>;
  return (
    <form className="f" onSubmit={send}>
      <label>Name<input name="name" autoComplete="name" /></label>
      <label>Email *<input name="email" type="email" required autoComplete="email" /></label>
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" /></label>
      <label>How can we help? *<textarea name="message" rows="5" required /></label>
      <input className="hp" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      {err && <p role="alert">{err}</p>}
      <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
    </form>
  );
}
