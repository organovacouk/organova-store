import { db } from "@/lib/db";
import { makeSession, COOKIE } from "@/lib/account";
import { googleProfile } from "@/lib/google";
import { loginCookie } from "@/lib/admin";
export async function GET(req) {
  const u = new URL(req.url), origin = u.origin, code = u.searchParams.get("code"), state = u.searchParams.get("state");
  const c = (req.headers.get("cookie") || "").match(/(?:^|;\s*)g_oauth=([^;]+)/); const [st, purpose, next] = c ? decodeURIComponent(c[1]).split("|") : [];
  const go = (path, cookies = []) => { const h = new Headers({ Location: origin + path }); for (const k of cookies) h.append("Set-Cookie", k); h.append("Set-Cookie", "g_oauth=; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0"); return new Response(null, { status: 303, headers: h }); };
  const bad = (e) => go((purpose === "admin" ? "/admin/login" : "/account") + "?e=" + e);
  if (!code || !state || !st || state !== st) return bad("google");
  let p; try { p = await googleProfile(code, origin); } catch { return bad("google"); }
  if (purpose === "admin") {
    const a = await db().prepare("SELECT * FROM admins WHERE email=?").bind(p.email).first();
    if (!a) return bad("denied");
    await db().prepare("UPDATE admins SET last_login=datetime('now'), name=COALESCE(name,?) WHERE id=?").bind(p.name, a.id).run();
    return go("/admin", [await loginCookie("admin:" + a.email)]);
  }
  await db().prepare("INSERT INTO members (email,name,google_sub,last_login) VALUES (?,?,?,datetime('now')) ON CONFLICT(email) DO UPDATE SET google_sub=excluded.google_sub, last_login=datetime('now'), name=COALESCE(members.name, excluded.name)").bind(p.email, p.name, p.sub).run();
  const dest = /^\/(?!\/)/.test(next || "") ? next : "/account";
  return go(dest, [`${COOKIE}=${await makeSession(p.email, "google")}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`]);
}
