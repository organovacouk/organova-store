import { db } from "@/lib/db";
import { paypal } from "@/lib/paypal";
import { hasPaidOrder } from "@/lib/order";
import { deliverable } from "@/lib/geo";
import { notify } from "@/lib/notify";
const fail = (orderID, status, error) => db().prepare("UPDATE orders SET status=? WHERE paypal_order_id=?").bind(status, orderID).run().then(() => Response.json({ ok: false, error }, { status: 422 }));
export async function POST(req) {
  const { orderID } = await req.json();
  const row = await db().prepare("SELECT * FROM orders WHERE paypal_order_id=? AND provider='paypal'").bind(orderID).first();
  if (!row) return Response.json({ ok: false }, { status: 404 });
  if (row.status === "paid") return Response.json({ ok: true });
  const { data: od } = await paypal(`/v2/checkout/orders/${encodeURIComponent(orderID)}`, null, "GET");
  const addr = od.purchase_units?.[0]?.shipping?.address;
  if (!deliverable(addr?.country_code, addr?.postal_code)) return fail(orderID, "rejected_address", "Sorry, we only deliver to addresses in Great Britain (not Northern Ireland or overseas). You have not been charged.");
  if (row.discount_code) {
    const d = await db().prepare("SELECT first_order_only FROM discounts WHERE code=?").bind(row.discount_code).first();
    if (d?.first_order_only && (await hasPaidOrder(od.payer?.email_address))) return fail(orderID, "rejected_code", "That discount code is only valid on a first order. You have not been charged. Please remove the code and try again.");
  }
  const { ok, data } = await paypal(`/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`);
  const cap = data?.purchase_units?.[0]?.payments?.captures?.[0];
  if (!ok || data.status !== "COMPLETED" || !cap || Math.round(parseFloat(cap.amount.value) * 100) !== row.total_pence) return fail(orderID, "failed", "Payment could not be completed. You have not been charged.");
  const ship = data.purchase_units[0].shipping || {};
  await db().prepare("UPDATE orders SET status='paid',email=?,name=?,shipping_json=?,paid_at=datetime('now') WHERE paypal_order_id=?")
    .bind(data.payer?.email_address || null, ship.name?.full_name || null, JSON.stringify(ship.address || {}), orderID).run();
  await notify("New Organova order (PayPal) £" + (row.total_pence / 100).toFixed(2), "Order #" + row.id + " from " + (data.payer?.email_address || "?") + ". See /admin for details.");
  return Response.json({ ok: true });
}
