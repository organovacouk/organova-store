import { db, env } from "./db";
export async function priceCart(items, code) {
  if (!Array.isArray(items) || !items.length || items.length > 50) return { error: "Your basket is empty" };
  const lines = [];
  for (const it of items) {
    const qty = Math.min(Math.max(parseInt(it.qty) || 0, 1), 20);
    const p = await db().prepare("SELECT handle,title,price_pence,available FROM products WHERE handle=? AND status='active'").bind(it.handle).first();
    if (!p) return { error: "A product in your basket is no longer available" };
    if (p.available === 0) return { error: p.title + " is currently sold out" };
    const nv = await db().prepare("SELECT COUNT(*) n FROM variants WHERE handle=?").bind(it.handle).first();
    if (nv.n > 0) {
      const v = await db().prepare("SELECT title,price_pence FROM variants WHERE id=? AND handle=?").bind(parseInt(it.variantId) || 0, it.handle).first();
      if (!v) return { error: "Please choose an option for every product" };
      p.price_pence = v.price_pence; p.title = p.title + " (" + v.title + ")";
    }
    lines.push({ ...p, qty });
  }
  const sub = lines.reduce((s, l) => s + l.price_pence * l.qty, 0);
  let discount = 0, d = null;
  if (code) {
    d = await db().prepare("SELECT code,percent,first_order_only FROM discounts WHERE UPPER(code)=UPPER(?) AND active=1").bind(String(code).trim()).first();
    if (!d) return { error: "That discount code isn't valid" };
    discount = Math.round((sub * d.percent) / 100);
  }
  const st = await db().prepare("SELECT value FROM settings WHERE key='shipping_pence'").first();
  const ship = st ? parseInt(st.value) || 0 : parseInt(env().SHIPPING_PENCE || "0");
  return { lines, sub, discount, ship, total: sub - discount + ship, d };
}
export async function hasPaidOrder(email) {
  if (!email) return false;
  const r = await db().prepare("SELECT COUNT(*) n FROM orders WHERE status='paid' AND LOWER(email)=LOWER(?)").bind(email.trim()).first();
  return r.n > 0;
}
export const money = (p) => (p / 100).toFixed(2);
