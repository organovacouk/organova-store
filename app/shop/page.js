import { db } from "@/lib/db";
import { SEL } from "@/lib/q";
import Card from "@/components/Card";
export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }) { const { type, sale } = await searchParams; return { title: sale ? "Sale" : type || "Shop all" }; }
const ORDER = { new: "p.id DESC", low: "COALESCE((SELECT MIN(price_pence) FROM variants v WHERE v.handle=p.handle),p.price_pence) ASC", high: "COALESCE((SELECT MIN(price_pence) FROM variants v WHERE v.handle=p.handle),p.price_pence) DESC", def: "p.id ASC" };
export default async function Shop({ searchParams }) {
  const { type, sale, sort, min = "", max = "", stock } = await searchParams;
  const d = db();
  const rooms = (await d.prepare("SELECT product_type t, COUNT(*) n FROM products WHERE status='active' GROUP BY product_type ORDER BY n DESC").all()).results;
  let q = SEL; const b = [];
  if (type) { q += " AND p.product_type=?"; b.push(type); }
  if (sale) q += " AND p.compare_at_pence>p.price_pence";
  const PR = "COALESCE((SELECT MIN(price_pence) FROM variants v WHERE v.handle=p.handle),p.price_pence)";
  const lo = Math.round(parseFloat(min) * 100), hi = Math.round(parseFloat(max) * 100);
  if (lo > 0) { q += ` AND ${PR}>=?`; b.push(lo); }
  if (hi > 0) { q += ` AND ${PR}<=?`; b.push(hi); }
  if (stock) q += " AND p.available=1";
  q += " ORDER BY " + (ORDER[sort] || ORDER.def);
  const items = (await d.prepare(q).bind(...b).all()).results;
  const href = (o) => { const u = new URLSearchParams({ ...(type && { type }), ...(sale && { sale }), ...(sort && { sort }), ...(min && { min }), ...(max && { max }), ...(stock && { stock }), ...o }); return "/shop?" + u; };
  return (
    <>
      <div className="crumbs"><a href="/">Home</a> / <span>{sale ? "Sale" : type || "All products"}</span></div>
      <h1 className="ph1">{sale ? "Sale" : type || "All products"}</h1>
      <nav className="cats" aria-label="Rooms"><a href="/shop" className={!type && !sale ? "on" : ""}>All</a>{rooms.map((r) => <a key={r.t} href={"/shop?type=" + encodeURIComponent(r.t)} className={type === r.t ? "on" : ""}>{r.t}</a>)}</nav>
      <form method="get" className="filters">{type && <input type="hidden" name="type" value={type} />}{sale && <input type="hidden" name="sale" value="1" />}{sort && <input type="hidden" name="sort" value={sort} />}
        <label>Min £<input name="min" defaultValue={min} inputMode="decimal" placeholder="0" /></label><label>Max £<input name="max" defaultValue={max} inputMode="decimal" placeholder="any" /></label>
        <label className="chk"><input type="checkbox" name="stock" value="1" defaultChecked={!!stock} /> In stock only</label><button className="btn sm">Apply</button>{(min || max || stock) && <a href={type ? "/shop?type=" + encodeURIComponent(type) : "/shop"}>Clear filters</a>}</form>
      <div className="bar2"><span>{items.length} products</span>
        <span className="sort">Sort: {[["", "Featured"], ["new", "Newest"], ["low", "Price: low to high"], ["high", "Price: high to low"]].map(([k, l]) => <a key={k} href={href({ sort: k })} className={(sort || "") === k ? "on" : ""}>{l}</a>)}</span></div>
      <div className="grid">{items.map((p) => <Card key={p.id} p={p} />)}</div>
      {!items.length && <p>No products found.</p>}
    </>
  );
}
