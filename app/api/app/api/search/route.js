import { db } from "@/lib/db";
import { search, card } from "@/lib/search";
export async function GET(req) {
  const q = (new URL(req.url).searchParams.get("q") || "").slice(0, 80);
  if (q.trim().length < 2) return Response.json({ products: [], cats: [] });
  const products = (await search(q, 6)).map(card);
  const cats = (await db().prepare("SELECT product_type t FROM products WHERE status='active' AND product_type<>'' AND LOWER(product_type) LIKE ? GROUP BY product_type LIMIT 3").bind("%" + q.toLowerCase().trim() + "%").all()).results.map((r) => r.t);
  return Response.json({ products, cats });
}
