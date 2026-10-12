import { db } from "@/lib/db";
import { SEL, SITE } from "@/lib/q";
import { md } from "@/lib/md";
import Card from "./Card";
import ShopToolbar from "./ShopToolbar";
const PR = "COALESCE((SELECT MIN(price_pence) FROM variants v WHERE v.handle=p.handle),p.price_pence)";
const ORDER = { new: "p.id DESC", low: PR + " ASC", high: PR + " DESC", def: "p.id ASC" };
export default async function Listing({ cat, sp }) {
  const { sort, min = "", max = "", stock } = sp;
  let q = SEL; const b = [];
  if (cat?.type) { q += " AND p.product_type=?"; b.push(cat.type); }
  if (cat?.sale) q += " AND p.compare_at_pence>p.price_pence";
  const lo = Math.round(parseFloat(min) * 100), hi = Math.round(parseFloat(max) * 100);
  if (lo > 0) { q += ` AND ${PR}>=?`; b.push(lo); }
  if (hi > 0) { q += ` AND ${PR}<=?`; b.push(hi); }
  if (stock) q += " AND p.available=1";
  q += " ORDER BY " + (ORDER[sort] || ORDER.def);
  const items = (await db().prepare(q).bind(...b).all()).results;
  const title = cat?.h1 || "All products", path = cat ? "/collections/" + cat.slug : "/shop";
  const ld = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" }, ...(cat ? [{ "@type": "ListItem", position: 2, name: cat.label, item: SITE + path }] : [{ "@type": "ListItem", position: 2, name: "All products", item: SITE + "/shop" }])] },
    { "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: SITE + path, description: cat?.desc, mainEntity: { "@type": "ItemList", itemListElement: items.slice(0, 24).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: SITE + "/products/" + p.handle, name: p.title })) } },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="crumbs"><a href="/">Home</a> / {cat ? <span>{cat.label}</span> : <span>All products</span>}</div>
      <h1 className="ph1">{title}</h1>
      {cat?.intro && <p className="lead" style={{ margin: "0 0 14px" }}>{cat.intro}</p>}
      <ShopToolbar count={items.length} />
      <div className="grid">{items.map((p, i) => <Card key={p.id} p={p} />)}</div>
      {!items.length && <p>No products match those filters. Try widening the price range.</p>}
      {cat?.guide && <article className="doc guide" dangerouslySetInnerHTML={{ __html: md(cat.guide) }} />}
    </>
  );
}
