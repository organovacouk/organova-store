import { db, env } from "@/lib/db";
import { guard, pence } from "@/lib/admin";
import { stripe } from "@/lib/stripe";
import { stripeGet } from "@/lib/stripe-finalise";
import { paypal } from "@/lib/paypal";
import { refundEmail } from "@/lib/emails2";
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const f = await req.formData(); const id = parseInt(f.get("id")) || 0; const origin = new URL(req.url).origin; const d = db();
  const go = (m, ok) => new Response(null, { status: 303, headers: { Location: `${origin}/admin/orders/${id}?${ok ? "msg" : "err"}=${encodeURIComponent(m)}` } });
  const o = await d.prepare("SELECT * FROM orders WHERE id=?").bind(id).first();
  if (!o || o.status !== "paid") return go("Only paid orders can be refunded.");
  if (!["stripe", "paypal"].includes(o.provider)) return go("This order was paid through Shopify. Refund it there.");
  const left = o.total_pence - (o.refunded_pence || 0);
  const amt = String(f.get("amount") || "").trim() ? pence(f.get("amount")) : left;
  if (!(amt > 0) || amt > left) return go(`Enter an amount between £0.01 and £${(left / 100).toFixed(2)}.`);
  const reason = String(f.get("reason") || "").slice(0, 200);
  try {
    if (o.provider === "stripe") {
      const s = await stripeGet("/checkout/sessions/" + encodeURIComponent(o.paypal_order_id));
      if (!s.payment_intent) return go("Stripe has no payment on file for this order.");
      const r = await stripe("/refunds", { payment_intent: s.payment_intent, amount: amt });
      if (!r.ok) return go("Stripe refused the refund: " + (r.data?.error?.message || "unknown reason"));
    } else {
      const od = await paypal("/v2/checkout/orders/" + encodeURIComponent(o.paypal_order_id), null, "GET");
      const cap = od.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
      if (!cap) return go("PayPal has no captured payment for this order.");
      const r = await paypal(`/v2/payments/captures/${cap}/refund`, { amount: { value: (amt / 100).toFixed(2), currency_code: "GBP" }, note_to_payer: reason || undefined });
      if (!r.ok) return go("PayPal refused the refund: " + (r.data?.details?.[0]?.description || r.data?.message || "unknown reason"));
    }
  } catch (e) { return go("The refund could not be sent: " + String(e.message || e).slice(0, 150)); }
  const total = (o.refunded_pence || 0) + amt, full = total >= o.total_pence;
  const note = `${o.note ? o.note + "\n" : ""}Refunded £${(amt / 100).toFixed(2)} on ${new Date().toISOString().slice(0, 10)}${reason ? " (" + reason + ")" : ""}.`;
  await d.prepare("UPDATE orders SET refunded_pence=?, note=?, status=?, fulfilment=? WHERE id=?").bind(total, note, full ? "refunded" : "paid", full ? "cancelled" : o.fulfilment, id).run();
  if (full) await d.prepare("UPDATE commissions SET status='cancelled' WHERE order_id=? AND status IN ('pending','approved')").bind(id).run();
  if (o.email && f.get("notify") === "1") await refundEmail(o, amt, full);
  return go(`Refunded £${(amt / 100).toFixed(2)}${full ? " (full refund, order closed)" : ""}.`, true);
}
