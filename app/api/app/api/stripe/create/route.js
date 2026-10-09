import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { priceCart, hasPaidOrder } from "@/lib/order";
export async function POST(req) {
  const { items, code, email } = await req.json();
  const r = await priceCart(items, code);
  if (r.error) return Response.json({ error: r.error }, { status: 400 });
  if (r.d?.first_order_only) {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Please enter your email address to use a first-order code" }, { status: 400 });
    if (await hasPaidOrder(email)) return Response.json({ error: "This code is only valid on a first order" }, { status: 400 });
  }
  const origin = new URL(req.url).origin;
  const params = {
    mode: "payment", success_url: origin + "/thanks", cancel_url: origin + "/cart", currency: "gbp",
    customer_email: email || undefined,
    shipping_address_collection: { allowed_countries: ["GB"] }, phone_number_collection: { enabled: true },
    line_items: r.lines.map((l) => ({ quantity: l.qty, price_data: { currency: "gbp", unit_amount: l.price_pence, product_data: { name: l.title.slice(0, 120) } } })),
  };
  if (r.ship > 0) params.shipping_options = [{ shipping_rate_data: { type: "fixed_amount", display_name: "Delivery", fixed_amount: { amount: r.ship, currency: "gbp" } } }];
  if (r.d) { const c = await stripe("/coupons", { percent_off: r.d.percent, duration: "once", max_redemptions: 1 }); if (!c.ok) return Response.json({ error: "Could not apply code" }, { status: 502 }); params.discounts = [{ coupon: c.data.id }]; }
  const { ok, data } = await stripe("/checkout/sessions", params);
  if (!ok) return Response.json({ error: "Card checkout is unavailable right now" }, { status: 502 });
  await db().prepare("INSERT INTO orders (paypal_order_id,provider,status,email,items_json,subtotal_pence,shipping_pence,total_pence,discount_pence,discount_code) VALUES (?,?,?,?,?,?,?,?,?,?)")
    .bind(data.id, "stripe", "created", email || null, JSON.stringify(r.lines), r.sub, r.ship, r.total, r.discount, r.d?.code || null).run();
  return Response.json({ url: data.url });
}
