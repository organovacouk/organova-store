import { env } from "./db";
export async function notify(subject, text) {
  const e = env(); if (!e.RESEND_API_KEY) return;
  try { await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + e.RESEND_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: e.CONTACT_FROM || "Organova <noreply@organova.co.uk>", to: [e.CONTACT_TO || "support@organova.co.uk"], subject, text }) }); } catch {}
}
