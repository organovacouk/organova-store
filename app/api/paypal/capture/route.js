import { db } from "@/lib/db";
import { paypal } from "@/lib/paypal";
export async function POST(req) {
  const { orderID } = await req.json();
  const row = await db().prepare("SELECT * FROM orders WHERE paypal_order_id=?").bind(orderID).first();
  if (!row) return Response.json({ ok: false }, { status: 404 });
  if (row.status === "paid") return Response.json({ ok: true });
  const { ok, data } = await paypal(`/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`);
  const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
  if (!ok || data.status !== "COMPLETED" || !cap || Math.round(parseFloat(cap.amount.value) * 100) !== row.total_pence) {
    await db().prepare("UPDATE orders SET status='failed' WHERE paypal_order_id=?").bind(orderID).run();
    return Response.json({ ok: false }, { status: 402 });
  }
  const payer = data.payer || {}; const ship = data.purchase_units[0].shipping || {};
  await db().prepare("UPDATE orders SET status='paid',email=?,name=?,shipping_json=?,paid_at=datetime('now') WHERE paypal_order_id=?")
    .bind(payer.email_address || null, ship.name?.full_name || null, JSON.stringify(ship.address || {}), orderID).run();
  return Response.json({ ok: true });
}
