import { db, env } from "@/lib/db";
import { paypal } from "@/lib/paypal";
const money = (p) => (p / 100).toFixed(2);
export async function POST(req) {
  const { items = [] } = await req.json();
  if (!items.length || items.length > 50) return Response.json({ error: "Empty basket" }, { status: 400 });
  const lines = [];
  for (const it of items) {
    const qty = Math.min(Math.max(parseInt(it.qty) || 0, 1), 20);
    const p = await db().prepare("SELECT handle,title,price_pence FROM products WHERE handle=? AND status='active'").bind(it.handle).first();
    if (!p) return Response.json({ error: "Product unavailable" }, { status: 400 });
    const nv = await db().prepare("SELECT COUNT(*) n FROM variants WHERE handle=?").bind(it.handle).first();
    if (nv.n > 0) {
      const v = await db().prepare("SELECT id,title,price_pence FROM variants WHERE id=? AND handle=?").bind(parseInt(it.variantId) || 0, it.handle).first();
      if (!v) return Response.json({ error: "Please choose an option" }, { status: 400 });
      p.price_pence = v.price_pence; p.title = p.title + " (" + v.title + ")";
    }
    lines.push({ ...p, qty });
  }
  const sub = lines.reduce((s, l) => s + l.price_pence * l.qty, 0);
  const ship = parseInt(env().SHIPPING_PENCE || "0");
  const total = sub + ship;
  const { ok, data } = await paypal("/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [{
      amount: { currency_code: "GBP", value: money(total), breakdown: { item_total: { currency_code: "GBP", value: money(sub) }, shipping: { currency_code: "GBP", value: money(ship) } } },
      items: lines.map((l) => ({ name: l.title.slice(0, 120), quantity: String(l.qty), unit_amount: { currency_code: "GBP", value: money(l.price_pence) } })),
    }],
    application_context: { shipping_preference: "GET_FROM_FILE", brand_name: "Organova", user_action: "PAY_NOW" },
  });
  if (!ok) return Response.json({ error: "PayPal error" }, { status: 502 });
  await db().prepare("INSERT INTO orders (paypal_order_id,status,items_json,subtotal_pence,shipping_pence,total_pence) VALUES (?,?,?,?,?,?)")
    .bind(data.id, "created", JSON.stringify(lines), sub, ship, total).run();
  return Response.json({ id: data.id });
}
