import { cookies } from "next/headers";
import { db, env } from "./db";
import { readSession, makeSession } from "./account";
export const ADMIN_COOKIE = "org_admin";
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isAdmin = (id) => id === "__admin__" || (typeof id === "string" && id.startsWith("admin:"));
export async function adminOk() { return isAdmin(await readSession((await cookies()).get(ADMIN_COOKIE)?.value)); }
export async function adminEmail() { const id = await readSession((await cookies()).get(ADMIN_COOKIE)?.value); return id && id.startsWith("admin:") ? id.slice(6) : null; }
// For route handlers: true = signed in, false = wrong, null = no admin password configured at all
export async function authed(req) {
  const m = (req.headers.get("cookie") || "").match(/(?:^|;\s*)org_admin=([^;]+)/);
  if (m && isAdmin(await readSession(m[1]))) return true;
  const pw = env().ADMIN_PASSWORD; if (!pw) return null;
  try { const given = atob((req.headers.get("authorization") || "").replace(/^Basic /, "")).split(":").slice(1).join(":"); return given === pw; } catch { return false; }
}
export async function guard(req) { const a = await authed(req); if (a === null) return new Response("Not found", { status: 404 }); return a ? null : new Response("Unauthorized", { status: 401 }); }
export const back = (req, fallback = "/admin") => { let p = fallback; try { const r = new URL(req.headers.get("referer") || ""); if (r.origin === new URL(req.url).origin) p = r.pathname + r.search; } catch {} return new Response(null, { status: 303, headers: { Location: p } }); };
export async function loginCookie(identity = "__admin__") { return `org_admin=${await makeSession(identity, "admin")}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`; }
export const money = (p) => "£" + ((p || 0) / 100).toFixed(2);
export const pence = (v) => Math.round(parseFloat(String(v).replace(/[£,\s]/g, "")) * 100);
export const slugify = (t) => String(t).toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
export async function getSetting(key, fallback = null) { const r = await db().prepare("SELECT value FROM settings WHERE key=?").bind(key).first(); return r ? r.value : fallback; }
