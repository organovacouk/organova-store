import { db } from "@/lib/db";
import { guard } from "@/lib/admin";
import { stripeGet, finalizeStripeSession } from "@/lib/stripe-finalise";
import { paypal } from "@/lib/paypal";
// Asks Stripe or PayPal what really happened to an order stuck at "created".
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const id = parseInt((await req.formData()).get("id")) || 0; const origin = new URL(req.url).origin;
  const go = (m, ok) => new Response(null, { status: 303, headers: { Location: `${origin}/admin/orders?f=unfinished&${ok ? "msg" : "err"}=${encodeURIComponent(m)}` } });
  const o = await db().prepare("SELECT * FROM orders WHERE id=?").bind(id).first();
  if (!o || o.status !== "created") return go("That order is not waiting on a payment.");
  if (o.provider === "stripe") {
    const s = await stripeGet("/checkout/sessions/" + encodeURIComponent(o.paypal_order_id));
    if (s.error) return go("Stripe says: " + (s.error.message || "error"));
    if (s.payment_status === "paid") { const r = await finalizeStripeSession(s); return r.ok ? go(`Order #${1000 + id} was paid. It is now recorded and the customer has been emailed.`, true) : go("Stripe shows it as paid, but we could not record it: " + r.reason); }
    if (s.status === "expired") { await db().prepare("UPDATE orders SET status='expired' WHERE id=?").bind(id).run(); return go(`Order #${1000 + id}: the customer never paid and the checkout expired.`, true); }
    return go(`Order #${1000 + id}: Stripe shows the checkout as "${s.status}" and payment "${s.payment_status}". The customer has not paid yet.`, true);
  }
  const od = await paypal("/v2/checkout/orders/" + encodeURIComponent(o.paypal_order_id), null, "GET");
  return go(`PayPal says order #${1000 + id} is "${od.data?.status || "unknown"}". ${od.data?.status === "COMPLETED" ? "It was paid; please tell your assistant so it can be recorded." : "No payment was completed."}`, true);
}
