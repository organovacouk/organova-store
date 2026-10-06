import { db, env } from "@/lib/db";
import { stripe, verifySignature } from "@/lib/stripe";
import { deliverable } from "@/lib/geo";
import { notify } from "@/lib/notify";
export async function POST(req) {
  const body = await req.text();
  if (!(await verifySignature(body, req.headers.get("stripe-signature"), env().STRIPE_WEBHOOK_SECRET))) return new Response("bad signature", { status: 400 });
  const ev = JSON.parse(body);
  if (ev.type !== "checkout.session.completed") return Response.json({ received: true });
  const s = ev.data.object;
  if (s.payment_status !== "paid") return Response.json({ received: true });
  const a = s.shipping_details?.address || s.collected_information?.shipping_details?.address || {};
  const name = s.shipping_details?.name || s.customer_details?.name || null;
  if (!deliverable((a.country || "").toUpperCase(), a.postal_code)) {
    await stripe("/refunds", { payment_intent: s.payment_intent });
    await db().prepare("UPDATE orders SET status='refunded_address' WHERE paypal_order_id=?").bind(s.id).run();
    return Response.json({ received: true });
  }
  await db().prepare("UPDATE orders SET status='paid',email=?,name=?,shipping_json=?,total_pence=?,paid_at=datetime('now') WHERE paypal_order_id=? AND status<>'paid'")
    .bind(s.customer_details?.email || null, name, JSON.stringify(a), s.amount_total, s.id).run();
  await notify("New Organova order (card) £" + (s.amount_total / 100).toFixed(2), "From " + (s.customer_details?.email || "?") + ". See /admin for details.");
  return Response.json({ received: true });
}
