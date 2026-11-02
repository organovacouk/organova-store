"use client";
import "./signin.css";
import { useState } from "react";
const ERR = { google: "Google sign-in did not complete. Please try again.", nogoogle: "Google sign-in is not switched on yet." };
export default function AccountLogin({ google, error }) {
  const [mode, setMode] = useState("password"), [st, setSt] = useState("idle"), [err, setErr] = useState(ERR[error] || "");
  async function post(url, e, ok) {
    e.preventDefault(); setSt("sending"); setErr("");
    const r = await fetch(url, { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(e.target))) });
    if (r.ok) ok(); else { setSt("idle"); setErr((await r.json()).error || "Something went wrong."); }
  }
  if (st === "sent") return <p role="status"><strong>Check your inbox.</strong> We have emailed you a sign-in link. It works for 15 minutes. If it does not arrive, check your spam folder.</p>;
  return (
    <div style={{ maxWidth: 520 }}>
      {google && (<><a className="btn gbtn" href="/api/auth/google/start?for=customer"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" /><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" /></svg>Continue with Google</a>
        <p className="or"><span>or</span></p></>)}
      <div className="tabs" role="tablist"><a href="#" role="tab" aria-selected={mode === "password"} className={mode === "password" ? "on" : ""} onClick={(e) => { e.preventDefault(); setMode("password"); setErr(""); }}>Password</a><a href="#" role="tab" aria-selected={mode === "link"} className={mode === "link" ? "on" : ""} onClick={(e) => { e.preventDefault(); setMode("link"); setErr(""); }}>Email me a link</a></div>
      {mode === "password" ? (
        <form className="f" onSubmit={(e) => post("/api/account/password-login", e, () => (location.href = "/account"))}>
          <label>Email address<input name="email" type="email" required autoComplete="username" /></label>
          <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
          {err && <p role="alert">{err}</p>}<button className="btn" disabled={st === "sending"}>{st === "sending" ? "Signing in…" : "Sign in"}</button>
          <p className="note">Forgotten your password, or no password yet? Use <a href="#" onClick={(e) => { e.preventDefault(); setMode("link"); }}>an email link</a>, then set a new password in your account.</p></form>
      ) : (
        <form className="f" onSubmit={(e) => post("/api/account/login", e, () => setSt("sent"))}>
          <label>Email address<input name="email" type="email" required autoComplete="email" /></label><input className="hp" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
          {err && <p role="alert">{err}</p>}<button className="btn" disabled={st === "sending"}>{st === "sending" ? "Sending…" : "Email me a sign-in link"}</button>
          <p className="note">New here? The link creates your account automatically. You can add a password afterwards if you like.</p></form>)}
      <p className="note" style={{ marginTop: 14 }}>You can also check out as a guest at any time.</p>
    </div>
  );
}
