import { db, env } from "@/lib/db";
import { loginCookie } from "@/lib/admin";
import { verifyPassword } from "@/lib/password";
import { bump } from "@/lib/limit";
import { sha } from "@/lib/account";
export async function POST(req) {
  const f = await req.formData(); const email = String(f.get("email") || "").trim().toLowerCase().slice(0, 200), pw = String(f.get("password") || "").slice(0, 200);
  const hour = new Date().toISOString().slice(0, 13), ip = (await sha(req.headers.get("cf-connecting-ip") || "x")).slice(0, 16);
  const to = (q) => new Response(null, { status: 303, headers: { Location: "/admin/login?" + q } });
  if ((await bump(`afail:${ip}:${hour}`)) > 12 || (await bump(`afail:all:${hour}`)) > 80) return to("e=locked");
  if (email) { // a named admin account
    const a = await db().prepare("SELECT * FROM admins WHERE email=?").bind(email).first();
    const ok = await verifyPassword(pw, a?.password_hash, a?.password_salt);
    if (!a || !ok) return to("e=1");
    await db().prepare("UPDATE admins SET last_login=datetime('now') WHERE id=?").bind(a.id).run();
    return new Response(null, { status: 303, headers: { Location: "/admin", "Set-Cookie": await loginCookie("admin:" + a.email) } });
  }
  const real = env().ADMIN_PASSWORD; // the shared password, kept as a back-up way in
  if (!real || pw !== real) return to("e=1");
  return new Response(null, { status: 303, headers: { Location: "/admin", "Set-Cookie": await loginCookie() } });
}
