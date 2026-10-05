import { notFound } from "next/navigation";
import { db, gbp } from "@/lib/db";
import { AddToCart } from "@/components/cart";
export const dynamic = "force-dynamic";
async function get(handle) { return db().prepare("SELECT * FROM products WHERE handle=? AND status='active'").bind(handle).first(); }
export async function generateMetadata({ params }) { const p = await get((await params).handle); return p ? { title: p.title + " — Organova" } : {}; }
export default async function Product({ params }) {
  const p = await get((await params).handle);
  if (!p) notFound();
  return (
    <div className="pdp">
      <img src={p.image_url} alt={p.title} />
      <div>
        <h1>{p.title}</h1>
        <p><span className="price">{gbp(p.price_pence)}</span>{p.compare_at_pence && <span className="was">{gbp(p.compare_at_pence)}</span>}</p>
        <AddToCart item={{ handle: p.handle, title: p.title, price: p.price_pence, image: p.image_url }} />
        <div dangerouslySetInnerHTML={{ __html: p.description_html }} />
      </div>
    </div>
  );
}
