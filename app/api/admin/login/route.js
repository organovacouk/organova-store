import { db, env } from "@/lib/db";
import { loginCookie } from "@/lib/admin";
export async function POST(req) {
  const f = await req.formData(); const pw = String(f.get("password") || ""); const key = "fails:" + new Date().toISOString().slice(0, 13);
  const fails = parseInt((await db().prepare("SELECT value FROM settings WHERE key=?").bind(key).first())?.value || "0");
  const to = (q) => new Response(null, { status: 303, headers: { Location: "/admin/login?" + q } });
  if (fails >= 10) return to("e=locked");
  const real = env().ADMIN_PASSWORD;
  if (!real || pw !== real) { await db().prepare("INSERT INTO settings (key,value) VALUES (?,'1') ON CONFLICT(key) DO UPDATE SET value=CAST(value AS INTEGER)+1").bind(key).run(); return to("e=1"); }
  return new Response(null, { status: 303, headers: { Location: "/admin", "Set-Cookie": await loginCookie() } });
}
