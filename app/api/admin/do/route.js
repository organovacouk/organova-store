import { db } from "@/lib/db";
import { guard, back, pence } from "@/lib/admin";
import { shippedEmail } from "@/lib/emails";
const FUL = ["new", "ordered", "shipped", "delivered", "cancelled"];
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const f = await req.formData(); const act = f.get("action"); const id = parseInt(f.get("id")) || 0; const d = db();
  if (act === "review_approve") await d.prepare("UPDATE reviews SET approved=1 WHERE id=?").bind(id).run();
  if (act === "review_unapprove") await d.prepare("UPDATE reviews SET approved=0 WHERE id=?").bind(id).run();
  if (act === "review_delete") await d.prepare("DELETE FROM reviews WHERE id=?").bind(id).run();
  if (act === "message_toggle") await d.prepare("UPDATE messages SET handled=1-handled WHERE id=?").bind(id).run();
  if (act === "stock") await d.prepare("UPDATE products SET available=? WHERE id=?").bind(f.get("available") === "0" ? 0 : 1, id).run();
  if (act === "archive") await d.prepare("UPDATE products SET status='archived' WHERE id=?").bind(id).run();
  if (act === "note") await d.prepare("UPDATE orders SET note=? WHERE id=?").bind(String(f.get("note") || "").slice(0, 2000) || null, id).run();
  if (act === "discount_add") {
    const code = String(f.get("code") || "").trim().toUpperCase(); const pc = parseInt(f.get("percent"));
    if (/^[A-Z0-9_-]{3,30}$/.test(code) && pc >= 1 && pc <= 90) await d.prepare("INSERT OR REPLACE INTO discounts (code,percent,first_order_only,active) VALUES (?,?,?,1)").bind(code, pc, f.get("first") ? 1 : 0).run();
  }
  if (act === "discount_toggle") await d.prepare("UPDATE discounts SET active=1-active WHERE code=?").bind(String(f.get("code"))).run();
  if (act === "discount_delete") await d.prepare("DELETE FROM discounts WHERE code=?").bind(String(f.get("code"))).run();
  if (act === "category_rename") {
    const from = String(f.get("from") || ""), to = String(f.get("to") || "").trim().slice(0, 60);
    if (from && to) { await d.prepare("UPDATE products SET product_type=? WHERE product_type=?").bind(to, from).run(); return new Response(null, { status: 303, headers: { Location: new URL(req.url).origin + "/admin/categories?done=1" } }); }
  }
  if (act === "settings_save") {
    const p = pence(f.get("shipping")); if (Number.isFinite(p) && p >= 0 && p < 10000) await d.prepare("INSERT INTO settings (key,value) VALUES ('shipping_pence',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(String(p)).run();
    await d.prepare("INSERT INTO settings (key,value) VALUES ('chat_enabled',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(f.get("chat") === "0" ? "0" : "1").run();
    return new Response(null, { status: 303, headers: { Location: new URL(req.url).origin + "/admin/settings?saved=1" } });
  }
  if (act === "fulfil") {
    const prev = await d.prepare("SELECT fulfilment FROM orders WHERE id=?").bind(id).first();
    const st = FUL.includes(f.get("fulfilment")) ? f.get("fulfilment") : "new";
    const num = String(f.get("tracking_number") || "").trim().slice(0, 200);
    let url = String(f.get("tracking_url") || "").trim().slice(0, 500);
    if (num && !url) url = "https://global.cainiao.com/newDetail.htm?mailNoList=" + encodeURIComponent(num.split(/[,\s]+/)[0]);
    await d.prepare("UPDATE orders SET fulfilment=?, supplier_ref=?, tracking_number=?, tracking_url=?, shipped_at=CASE WHEN ?='shipped' AND shipped_at IS NULL THEN datetime('now') ELSE shipped_at END WHERE id=?").bind(st, String(f.get("supplier_ref") || "").trim().slice(0, 200) || null, num || null, url || null, st, id).run();
    if (st === "shipped" && prev?.fulfilment !== "shipped") { const o = await d.prepare("SELECT * FROM orders WHERE id=?").bind(id).first(); if (o?.email) await shippedEmail(o); }
  }
  return back(req);
}
