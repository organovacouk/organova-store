import { priceCart, hasPaidOrder } from "@/lib/order";
export async function POST(req) {
  const { code, email, items } = await req.json();
  const r = await priceCart(items, code);
  if (r.error) return Response.json({ error: r.error }, { status: 400 });
  if (r.d.first_order_only && email && (await hasPaidOrder(email))) return Response.json({ error: "This code is only valid on a first order" }, { status: 400 });
  return Response.json({ code: r.d.code, percent: r.d.percent, firstOnly: !!r.d.first_order_only });
}
