import { db, env } from "@/lib/db";
import { rand, sha } from "@/lib/account";
import { sendMail } from "@/lib/mail";
import { bump } from "@/lib/limit";
export async function POST(req) {
  const j = await req.json();
  if (j.website) return Response.json({ ok: true }); // honeypot
  const em = String(j.email || "").trim().toLowerCase().slice(0, 200);
  if (!/^\S+@\S+\.\S+$/.test(em)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!env().RESEND_API_KEY) return Response.json({ error: "Sign-in is not available just yet. Please check back soon, or contact us about your order." }, { status: 503 });
  const ip = (await sha(req.headers.get("cf-connecting-ip") || "unknown")).slice(0, 16), now = new Date().toISOString();
  if ((await bump(`login:${ip}:${now.slice(0, 13)}`)) > 8) return Response.json({ ok: true });
  if ((await bump("login:day:" + now.slice(0, 10))) > parseInt(env().LOGIN_DAILY_LIMIT || "500")) return Response.json({ error: "Sign-in is very busy right now. Please try again later." }, { status: 503 });
  const recent = await db().prepare("SELECT COUNT(*) n FROM login_tokens WHERE email=? AND expires > datetime('now','+5 minutes')").bind(em).first();
  if (recent.n < 3) {
    const token = rand(32);
    await db().prepare("INSERT INTO login_tokens (hash,email,expires) VALUES (?,?,datetime('now','+15 minutes'))").bind(await sha(token), em).run();
    await sendMail({ to: em, subject: "Your Organova sign-in link", text: `Use this link to sign in to Organova (valid for 15 minutes):\n\n${new URL(req.url).origin}/account/verify?token=${token}\n\nNew here? Opening the link creates your account automatically. If you did not ask for this, you can ignore this email and nothing will happen.\n\nOrganova` });
  }
  return Response.json({ ok: true });
}
