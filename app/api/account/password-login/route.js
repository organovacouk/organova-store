import { db } from "@/lib/db";
import { makeSession, COOKIE, sha } from "@/lib/account";
import { verifyPassword } from "@/lib/password";
import { bump } from "@/lib/limit";
export async function POST(req) {
  const j = await req.json(); const email = String(j.email || "").trim().toLowerCase().slice(0, 200), pw = String(j.password || "").slice(0, 200);
  const hour = new Date().toISOString().slice(0, 13), ip = (await sha(req.headers.get("cf-connecting-ip") || "x")).slice(0, 16);
  if ((await bump(`pw:${ip}:${hour}`)) > 20 || (await bump(`pwe:${(await sha(email)).slice(0, 16)}:${hour}`)) > 8) return Response.json({ error: "Too many attempts. Please wait an hour, or use Google or an email link." }, { status: 429 });
  const m = email ? await db().prepare("SELECT * FROM members WHERE email=?").bind(email).first() : null;
  const ok = await verifyPassword(pw, m?.password_hash, m?.password_salt);
  if (!m || !ok) return Response.json({ error: "That email and password do not match. You can also sign in with Google or an email link." }, { status: 401 });
  await db().prepare("UPDATE members SET last_login=datetime('now') WHERE id=?").bind(m.id).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "Set-Cookie": `${COOKIE}=${await makeSession(m.email, "password")}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` } });
}
