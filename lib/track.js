import { db } from "./db";
import { addr, itemsOf } from "./addr";
const enc = new TextEncoder();
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
async function secret() {
  let r = await db().prepare("SELECT value FROM settings WHERE key='session_secret'").first();
  if (!r) { await db().prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('session_secret',?)").bind(hex(crypto.getRandomValues(new Uint8Array(32)))).run(); r = await db().prepare("SELECT value FROM settings WHERE key='session_secret'").first(); }
  return r.value;
}
export async function trackToken(o) {
  const k = await crypto.subtle.importKey("raw", enc.encode(await secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", k, enc.encode(`track:${o.id}:${String(o.email || "").toLowerCase()}`))).slice(0, 32);
}
export const trackLink = async (o, origin) => `${origin}/track?o=${1000 + o.id}&k=${await trackToken(o)}`;
export async function deliveryWindow() {
  const g = async (k, d) => { const r = await db().prepare("SELECT value FROM settings WHERE key=?").bind(k).first(); const n = parseInt(r?.value); return Number.isFinite(n) && n >= 0 ? n : d; };
  return { min: await g("delivery_min", 7), max: await g("delivery_max", 15), late: await g("late_after_days", 4) };
}
const parse = (s) => new Date(String(s).replace(" ", "T") + "Z");
export function addBusinessDays(d, n) { const x = new Date(d); let left = n; while (left > 0) { x.setUTCDate(x.getUTCDate() + 1); const w = x.getUTCDay(); if (w !== 0 && w !== 6) left--; } return x; }
export const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
export async function trackView(o) {
  const w = await deliveryWindow(); const st = o.fulfilment; const paid = parse(o.paid_at || o.created_at);
  const shipped = o.shipped_at ? parse(o.shipped_at) : null, delivered = o.delivered_at ? parse(o.delivered_at) : null;
  const state = st === "cancelled" || o.status === "refunded" ? "cancelled" : st === "delivered" ? "delivered" : st === "shipped" ? "shipped" : "processing";
  const from = shipped ? addBusinessDays(shipped, w.min) : addBusinessDays(paid, 1 + w.min), to = shipped ? addBusinessDays(shipped, w.max) : addBusinessDays(paid, 3 + w.max);
  const out = st === "shipped" || st === "delivered";
  return { number: "#" + (1000 + o.id), state, refunded: o.refunded_pence > 0, estimate: { from: fmtDate(from), to: fmtDate(to) }, city: addr(o.shipping_json).city,
    steps: [{ label: "Order placed", status: "done", date: fmtDate(paid) }, { label: "Being prepared", status: out ? "done" : "current" }, { label: "Shipped", status: st === "delivered" ? "done" : st === "shipped" ? "current" : "todo", date: shipped ? fmtDate(shipped) : null }, { label: "Delivered", status: st === "delivered" ? "done" : "todo", date: delivered ? fmtDate(delivered) : null }],
    items: itemsOf(o.items_json).map((l) => ({ title: l.title, qty: l.qty })), tracking: { number: o.tracking_number || null, url: o.tracking_url || null } };
}
