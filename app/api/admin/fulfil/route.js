import { db } from "@/lib/db";
import { guard } from "@/lib/admin";
import { shippedEmail2, deliveredEmail } from "@/lib/emails2";
const FUL = ["new", "ordered", "shipped", "delivered", "cancelled"];
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const f = await req.formData(); const id = parseInt(f.get("id")) || 0; const origin = new URL(req.url).origin; const d = db();
  const go = (m) => new Response(null, { status: 303, headers: { Location: `${origin}/admin/orders/${id}?msg=${encodeURIComponent(m)}` } });
  const prev = await d.prepare("SELECT * FROM orders WHERE id=?").bind(id).first(); if (!prev) return new Response("Not found", { status: 404 });
  if (f.get("action") === "resend") {
    if (!prev.email || !prev.tracking_number) return go("Add a tracking number and the customer's email first.");
    await shippedEmail2(prev, origin); return go("Tracking email sent again.");
  }
  let st = FUL.includes(f.get("fulfilment")) ? f.get("fulfilment") : "new";
  const num = String(f.get("tracking_number") || "").trim().slice(0, 200);
  let url = String(f.get("tracking_url") || "").trim().slice(0, 500);
  if (num && !url) url = "https://global.cainiao.com/newDetail.htm?mailNoList=" + encodeURIComponent(num.split(/[,\s]+/)[0]);
  if (num && (st === "new" || st === "ordered")) st = "shipped"; // entering a tracking number ships the order
  await d.prepare("UPDATE orders SET fulfilment=?, supplier_ref=?, tracking_number=?, tracking_url=?, shipped_at=CASE WHEN ?='shipped' AND shipped_at IS NULL THEN datetime('now') ELSE shipped_at END, delivered_at=CASE WHEN ?='delivered' AND delivered_at IS NULL THEN datetime('now') ELSE delivered_at END WHERE id=?")
    .bind(st, String(f.get("supplier_ref") || "").trim().slice(0, 200) || null, num || null, url || null, st, st, id).run();
  if (st === "cancelled") await d.prepare("UPDATE commissions SET status='cancelled' WHERE order_id=? AND status IN ('pending','approved')").bind(id).run();
  else if (prev.fulfilment === "cancelled") await d.prepare("UPDATE commissions SET status='pending' WHERE order_id=? AND status='cancelled'").bind(id).run();
  const o = await d.prepare("SELECT * FROM orders WHERE id=?").bind(id).first(); const sent = [];
  if (f.get("notify") === "1" && o.email) {
    if (st === "shipped" && num && (prev.fulfilment !== "shipped" || prev.tracking_number !== num)) { await shippedEmail2(o, origin); sent.push("shipping email with tracking"); }
    if (st === "delivered" && prev.fulfilment !== "delivered") { await deliveredEmail(o, origin); sent.push("delivered email"); }
  }
  return go("Saved." + (sent.length ? " Emailed the customer: " + sent.join(", ") + "." : st === "shipped" && !num ? " No email sent because there is no tracking number yet." : ""));
}
