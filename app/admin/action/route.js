import { db } from "@/lib/db";
import { authed, challenge } from "@/lib/admin";
import { shippedEmail } from "@/lib/emails";
const FUL = ["new", "ordered", "shipped", "delivered", "cancelled"];
export async function POST(req) {
  const a = authed(req); if (a === null) return new Response("Not found", { status: 404 }); if (!a) return challenge();
  const f = await req.formData(); const id = parseInt(f.get("id")); const act = f.get("action"); const back = new URL(req.url).origin;
  let loc = "/admin";
  if (act === "approve") await db().prepare("UPDATE reviews SET approved=1 WHERE id=?").bind(id).run();
  if (act === "delete") await db().prepare("DELETE FROM reviews WHERE id=?").bind(id).run();
  if (act === "product") {
    const url = String(f.get("supplier_url") || "").trim().slice(0, 500);
    await db().prepare("UPDATE products SET available=?, supplier_url=? WHERE id=?").bind(f.get("available") === "0" ? 0 : 1, /^https?:\/\//.test(url) ? url : null, id).run();
    loc = "/admin/products";
  }
  if (act === "fulfil") {
    const prev = await db().prepare("SELECT fulfilment FROM orders WHERE id=?").bind(id).first();
    const st = FUL.includes(f.get("fulfilment")) ? f.get("fulfilment") : "new";
    const num = String(f.get("tracking_number") || "").trim().slice(0, 200);
    let url = String(f.get("tracking_url") || "").trim().slice(0, 500);
    if (num && !url) url = "https://global.cainiao.com/newDetail.htm?mailNoList=" + encodeURIComponent(num.split(/[,\s]+/)[0]);
    await db().prepare("UPDATE orders SET fulfilment=?, supplier_ref=?, tracking_number=?, tracking_url=?, shipped_at=CASE WHEN ?='shipped' AND shipped_at IS NULL THEN datetime('now') ELSE shipped_at END WHERE id=?").bind(st, String(f.get("supplier_ref") || "").trim().slice(0, 200) || null, num || null, url || null, st, id).run();
    if (st === "shipped" && prev?.fulfilment !== "shipped") { const o = await db().prepare("SELECT * FROM orders WHERE id=?").bind(id).first(); if (o?.email) await shippedEmail(o); }
    loc = "/admin#o" + id;
  }
  return new Response(null, { status: 303, headers: { Location: back + loc } });
}
