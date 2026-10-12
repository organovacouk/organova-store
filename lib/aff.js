import { db } from "./db";
export const CODE_RE = /^[A-Z0-9]{3,20}$/;
export const refFromReq = (req) => { const m = (req.headers.get("cookie") || "").match(/(?:^|;\s*)org_ref=([A-Za-z0-9]{3,20})/); return m ? m[1].toUpperCase() : null; };
export async function affByCode(code) {
  if (!code || !CODE_RE.test(String(code).toUpperCase())) return null;
  return db().prepare("SELECT * FROM affiliates WHERE code=? AND status='active'").bind(String(code).toUpperCase()).first();
}
// Keep the customer discount code (same as the affiliate code) in step with the affiliate record
export async function syncDiscount(a) {
  await db().prepare("DELETE FROM discounts WHERE UPPER(code)=?").bind(a.code).run();
  if (a.status === "active" && a.discount_pct > 0) await db().prepare("INSERT INTO discounts (code,percent,first_order_only,active) VALUES (?,?,0,1)").bind(a.code, a.discount_pct).run();
}
export async function recordCommission(o) {
  if (!o || o.status !== "paid") return;
  if (await db().prepare("SELECT 1 x FROM commissions WHERE order_id=?").bind(o.id).first()) return;
  let a = null, src = null;
  if (o.discount_code) { a = await affByCode(o.discount_code); if (a) src = "code"; }
  if (!a && o.aff_code) { a = await affByCode(o.aff_code); if (a) src = "link"; }
  if (!a) return;
  if (o.email && String(a.email).toLowerCase() === String(o.email).toLowerCase()) return; // no self-referrals
  const base = Math.max(0, (o.subtotal_pence || 0) - (o.discount_pence || 0)), amt = Math.round((base * a.commission_pct) / 100);
  if (amt <= 0) return;
  await db().prepare("INSERT OR IGNORE INTO commissions (order_id,affiliate_id,source,base_pence,rate_pct,amount_pence) VALUES (?,?,?,?,?,?)").bind(o.id, a.id, src, base, a.commission_pct, amt).run();
}
export async function affStats(id) {
  const d = db();
  const c = await d.prepare("SELECT COALESCE(SUM(CASE WHEN status='pending' THEN amount_pence END),0) pending, COALESCE(SUM(CASE WHEN status='approved' THEN amount_pence END),0) approved, COALESCE(SUM(CASE WHEN status='paid' THEN amount_pence END),0) paid, COUNT(CASE WHEN status<>'cancelled' THEN 1 END) orders, COALESCE(SUM(CASE WHEN status<>'cancelled' THEN base_pence END),0) sales FROM commissions WHERE affiliate_id=?").bind(id).first();
  const k = await d.prepare("SELECT COALESCE(SUM(clicks),0) n FROM aff_clicks WHERE affiliate_id=?").bind(id).first();
  const k30 = await d.prepare("SELECT COALESCE(SUM(clicks),0) n FROM aff_clicks WHERE affiliate_id=? AND day>=date('now','-29 day')").bind(id).first();
  return { ...c, clicks: k.n, clicks30: k30.n };
}
