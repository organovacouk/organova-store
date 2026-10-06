import { db, env } from "@/lib/db";
import { rand, sha } from "@/lib/account";
import { sendMail } from "@/lib/mail";
export async function POST(req) {
  const { email } = await req.json();
  const em = String(email || "").trim().toLowerCase().slice(0, 200);
  if (!/^\S+@\S+\.\S+$/.test(em)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!env().RESEND_API_KEY) return Response.json({ error: "Email sign-in is not switched on yet. Please contact us about your order." }, { status: 503 });
  const has = await db().prepare("SELECT 1 x FROM orders WHERE status='paid' AND LOWER(email)=?").bind(em).first();
  const recent = await db().prepare("SELECT COUNT(*) n FROM login_tokens WHERE email=? AND expires > datetime('now','+5 minutes')").bind(em).first();
  if (has && recent.n < 3) {
    const token = rand(32);
    await db().prepare("INSERT INTO login_tokens (hash,email,expires) VALUES (?,?,datetime('now','+15 minutes'))").bind(await sha(token), em).run();
    await sendMail({ to: em, subject: "Your Organova sign-in link", text: `Use this link to see your orders (valid for 15 minutes):\n\n${new URL(req.url).origin}/account/verify?token=${token}\n\nIf you did not ask for this, you can ignore this email.\n\nOrganova` });
  }
  return Response.json({ ok: true });
}
