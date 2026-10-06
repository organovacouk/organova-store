import { db } from "@/lib/db";
import { SEL } from "@/lib/q";
import Card from "@/components/Card";
export const dynamic = "force-dynamic";
export const metadata = { title: "Search", robots: { index: false } };
export default async function Search({ searchParams }) {
  const { q = "" } = await searchParams;
  const term = "%" + q.trim().replace(/[%_]/g, "") + "%";
  const items = q.trim() ? (await db().prepare(SEL + " AND (p.title LIKE ?1 OR p.tags LIKE ?1 OR p.product_type LIKE ?1) ORDER BY p.id LIMIT 60").bind(term).all()).results : [];
  return (<><h1 className="ph1">{q ? `Results for “${q}”` : "Search"}</h1>{q && <p>{items.length} product{items.length === 1 ? "" : "s"} found</p>}<div className="grid">{items.map((p) => <Card key={p.id} p={p} />)}</div>{q && !items.length && <p>Nothing matched. Try a simpler word, or <a href="/shop">browse all products</a>.</p>}</>);
}
