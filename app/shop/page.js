import { db } from "@/lib/db";
import { SEL } from "@/lib/q";
import Card from "@/components/Card";
import ShopToolbar from "@/components/ShopToolbar";
export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }) { const { type, sale } = await searchParams; return { title: sale ? "Sale" : type || "Shop all" }; }
const PR = "COALESCE((SELECT MIN(price_pence) FROM variants v WHERE v.handle=p.handle),p.price_pence)";
const ORDER = { new: "p.id DESC", low: PR + " ASC", high: PR + " DESC", def: "p.id ASC" };
export default async function Shop({ searchParams }) {
  const { type, sale, sort, min = "", max = "", stock } = await searchParams;
  let q = SEL; const b = [];
  if (type) { q += " AND p.product_type=?"; b.push(type); }
  if (sale) q += " AND p.compare_at_pence>p.price_pence";
  const lo = Math.round(parseFloat(min) * 100), hi = Math.round(parseFloat(max) * 100);
  if (lo > 0) { q += ` AND ${PR}>=?`; b.push(lo); }
  if (hi > 0) { q += ` AND ${PR}<=?`; b.push(hi); }
  if (stock) q += " AND p.available=1";
  q += " ORDER BY " + (ORDER[sort] || ORDER.def);
  const items = (await db().prepare(q).bind(...b).all()).results;
  const title = sale ? "Sale" : type || "All products";
  return (
    <>
      <div className="crumbs"><a href="/">Home</a> / <span>{title}</span></div>
      <h1 className="ph1">{title}</h1>
      <ShopToolbar count={items.length} />
      <div className="grid">{items.map((p) => <Card key={p.id} p={p} />)}</div>
      {!items.length && <p>No products match those filters. Try widening the price range.</p>}
    </>
  );
}
