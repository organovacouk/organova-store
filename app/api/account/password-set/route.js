import { db } from "@/lib/db";
import { sessionInfo, COOKIE } from "@/lib/account";
import { hashPassword, verifyPassword, checkPassword } from "@/lib/password";
import { bump } from "@/lib/limit";
export async function POST(req) {
  const c = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)")); const info = await sessionInfo(c?.[1]);
  if (!info) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const j = await req.json(); const m = await db().prepare("SELECT * FROM members WHERE email=?").bind(info.e).first(); if (!m) return Response.json({ error: "Account not found." }, { status: 404 });
  if ((await bump(`pwset:${info.e}:${new Date().toISOString().slice(0, 13)}`)) > 10) return Response.json({ error: "Too many tries. Please wait an hour." }, { status: 429 });
  if (m.password_hash && !(Date.now() - (info.t || 0) < 30 * 60 * 1000) && !(await verifyPassword(String(j.current || ""), m.password_hash, m.password_salt))) return Response.json({ error: "Please enter your current password, or sign in again with Google or an email link first." }, { status: 400 });
  const why = await checkPassword(String(j.password || ""), info.e); if (why) return Response.json({ error: why }, { status: 400 });
  const h = await hashPassword(j.password); await db().prepare("UPDATE members SET password_hash=?, password_salt=? WHERE email=?").bind(h.hash, h.salt, info.e).run();
  return Response.json({ ok: true });
}
