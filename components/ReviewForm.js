"use client";
import { useState } from "react";
export default function ReviewForm({ handle }) {
  const [st, setSt] = useState("idle"), [err, setErr] = useState(""), [rating, setRating] = useState(5);
  async function send(e) {
    e.preventDefault(); setSt("sending"); setErr("");
    const f = Object.fromEntries(new FormData(e.target));
    const r = await fetch("/api/reviews", { method: "POST", body: JSON.stringify({ ...f, rating, handle }) });
    if (r.ok) setSt("sent"); else { setSt("idle"); setErr((await r.json()).error || "Something went wrong."); }
  }
  if (st === "sent") return <p role="status"><strong>Thank you.</strong> Your review will appear once we have checked it.</p>;
  return (
    <form className="f" onSubmit={send}>
      <fieldset className="pick"><legend>Your rating</legend>{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} aria-label={n + " stars"} aria-pressed={n <= rating} className={n <= rating ? "on" : ""}>★</button>)}</fieldset>
      <label>Your name<input name="name" required maxLength="60" /></label>
      <label>Email (never shown; used to mark verified purchases)<input name="email" type="email" required /></label>
      <label>Headline<input name="title" maxLength="100" /></label>
      <label>Your review<textarea name="body" rows="4" required minLength="10" maxLength="2000" /></label>
      <input className="hp" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      {err && <p role="alert">{err}</p>}
      <button className="btn" disabled={st === "sending"}>{st === "sending" ? "Sending…" : "Submit review"}</button>
    </form>
  );
}
