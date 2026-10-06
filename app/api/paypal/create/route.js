import { db } from "@/lib/db";
import { paypal } from "@/lib/paypal";
import { priceCart, money } from "@/lib/order";
export async function POST(req) {
  const { items, code } = await req.json();
  const r = await priceCart(items, code);
  if (r.error) return Response.json({ error: r.error }, { status: 400 });
  const cur = (v) => ({ currency_code: "GBP", value: money(v) });
  const { ok, data } = await paypal("/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [{
      amount: { ...cur(r.total), breakdown: { item_total: cur(r.sub), shipping: cur(r.ship), discount: cur(r.discount) } },
      items: r.lines.map((l) => ({ name: l.title.slice(0, 120), quantity: String(l.qty), unit_amount: cur(l.price_pence) })),
    }],
    application_context: { shipping_preference: "GET_FROM_FILE", brand_name: "Organova", user_action: "PAY_NOW" },
  });
  if (!ok) return Response.json({ error: "PayPal error" }, { status: 502 });
  await db().prepare("INSERT INTO orders (paypal_order_id,provider,status,items_json,subtotal_pence,shipping_pence,total_pence,discount_pence,discount_code) VALUES (?,?,?,?,?,?,?,?,?)")
    .bind(data.id, "paypal", "created", JSON.stringify(r.lines), r.sub, r.ship, r.total, r.discount, r.d?.code || null).run();
  return Response.json({ id: data.id });
}
