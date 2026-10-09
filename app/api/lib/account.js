import { db } from "./db";
const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
export const rand = (n = 32) => hex(crypto.getRandomValues(new Uint8Array(n)));
export const sha = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
async function secret() {
  let r = await db().prepare("SELECT value FROM settings WHERE key='session_secret'").first();
  if (!r) { await db().prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('session_secret',?)").bind(rand(32)).run(); r = await db().prepare("SELECT value FROM settings WHERE key='session_secret'").first(); }
  return r.value;
}
async function sign(payload) { const k = await crypto.subtle.importKey("raw", enc.encode(await secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); return hex(await crypto.subtle.sign("HMAC", k, enc.encode(payload))); }
export async function makeSession(email) { const p = btoa(JSON.stringify({ e: email, x: Date.now() + 30 * 864e5 })); return p + "." + (await sign(p)); }
export async function readSession(cookie) {
  if (!cookie) return null; const [p, s] = cookie.split(".");
  if (!p || !s || (await sign(p)) !== s) return null;
  try { const j = JSON.parse(atob(p)); return j.x > Date.now() ? j.e : null; } catch { return null; }
}
export const COOKIE = "org_session";
