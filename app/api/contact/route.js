import { db, env } from "@/lib/db";
export async function POST(req) {
  const j = await req.json();
  if (j.website) return Response.json({ ok: true }); // honeypot
  const name = String(j.name || "").slice(0, 120), email = String(j.email || "").trim().slice(0, 200), phone = String(j.phone || "").slice(0, 40), body = String(j.message || "").trim().slice(0, 4000);
  if (!/^\S+@\S+\.\S+$/.test(email) || body.length < 5) return Response.json({ error: "Please enter a valid email and a message." }, { status: 400 });
  const recent = await db().prepare("SELECT COUNT(*) n FROM messages WHERE created_at > datetime('now','-1 hour')").first();
  if (recent.n >= 30) return Response.json({ error: "Too many messages right now. Please email us directly." }, { status: 429 });
  await db().prepare("INSERT INTO messages (name,email,phone,body) VALUES (?,?,?,?)").bind(name, email, phone, body).run();
  const key = env().RESEND_API_KEY;
  if (key) {
    try {
      await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env().CONTACT_FROM || "Organova <noreply@organova.co.uk>", to: [env().CONTACT_TO || "support@organova.co.uk"], reply_to: email, subject: "Website message from " + (name || email), text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${body}` }) });
    } catch {}
  }
  return Response.json({ ok: true });
}
