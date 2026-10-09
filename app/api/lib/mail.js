import { env } from "./db";
export async function sendMail({ to, subject, text, replyTo }) {
  const e = env(); if (!e.RESEND_API_KEY || !to) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + e.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: e.MAIL_FROM || "Organova <orders@organova.co.uk>", to: [to], subject, text, reply_to: replyTo || "support@organova.co.uk" }) });
    return r.ok;
  } catch { return false; }
}
