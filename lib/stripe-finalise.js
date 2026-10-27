import { db, env } from "./db";
import { deliverable } from "./geo";
import { stripe } from "./stripe";
import { notify } from "./notify";
import { confirmationEmail } from "./emails";
import { recordCommission } from "./aff";
export const stripeGet = async (path) => (await fetch("https://api.stripe.com/v1" + path, { headers: { Authorization: "Bearer " + env().STRIPE_SECRET_KEY } })).json();
// Marks a Stripe order as paid exactly once. Called by the webhook, by the customer's return to the site, and by the admin "Check with Stripe" button.
export async function finalizeStripeSession(s) {
  if (!s || s.object !== "checkout.session") return { ok: false, reason: "Stripe did not return a session" };
  if (s.payment_status !== "paid") return { ok: false, reason: "not paid" };
  const row = await db().prepare("SELECT * FROM orders WHERE paypal_order_id=? AND provider='stripe'").bind(s.id).first();
  if (!row) return { ok: false, reason: "no matching order in the store" };
  if (row.status === "paid") return { ok: true, already: true };
  const a = s.shipping_details?.address || s.collected_information?.shipping_details?.address || {};
  const name = s.shipping_details?.name || s.collected_information?.shipping_details?.name || s.customer_details?.name || null;
  if (!deliverable((a.country || "").toUpperCase(), a.postal_code)) {
    await stripe("/refunds", { payment_intent: s.payment_intent });
    await db().prepare("UPDATE orders SET status='refunded_address' WHERE paypal_order_id=?").bind(s.id).run();
    return { ok: false, reason: "address outside Great Britain (refunded)" };
  }
  const r = await db().prepare("UPDATE orders SET status='paid',email=?,name=?,shipping_json=?,total_pence=?,paid_at=datetime('now') WHERE paypal_order_id=? AND status<>'paid'")
    .bind(s.customer_details?.email || null, name, JSON.stringify({ ...a, phone: s.customer_details?.phone || null }), s.amount_total, s.id).run();
  if (!r.meta.changes) return { ok: true, already: true };
  const paid = await db().prepare("SELECT * FROM orders WHERE paypal_order_id=?").bind(s.id).first();
  await confirmationEmail(paid); await recordCommission(paid);
  await notify("New Organova order (card) £" + (s.amount_total / 100).toFixed(2), "Order #" + (1000 + paid.id) + " from " + (s.customer_details?.email || "?") + ". See /admin/orders for details.");
  return { ok: true };
}
