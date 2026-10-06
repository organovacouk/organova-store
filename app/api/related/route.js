import { db } from "@/lib/db";
import { SEL } from "@/lib/q";
export async function GET(req) {
  const hs = (new URL(req.url).searchParams.get("h") || "").split(",").filter(Boolean).slice(0, 20);
  if (!hs.length) return Response.json([]);
  const ph = hs.map(() => "?").join(",");
  const types = (await db().prepare(`SELECT DISTINCT product_type t FROM products WHERE handle IN (${ph})`).bind(...hs).all()).results.map((r) => r.t);
  if (!types.length) return Response.json([]);
  const rows = (await db().prepare(SEL + ` AND p.available=1 AND p.product_type IN (${types.map(() => "?").join(",")}) AND p.handle NOT IN (${ph}) AND NOT EXISTS (SELECT 1 FROM variants v WHERE v.handle=p.handle) ORDER BY RANDOM() LIMIT 4`).bind(...types, ...hs).all()).results;
  return Response.json(rows.map((p) => ({ handle: p.handle, title: p.title, price: p.price_pence, compare: p.compare_at_pence, image: p.image_url })));
}
