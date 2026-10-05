import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Buy } from "@/components/cart";
export const dynamic = "force-dynamic";
async function get(handle) { return db().prepare("SELECT * FROM products WHERE handle=? AND status='active'").bind(handle).first(); }
export async function generateMetadata({ params }) { const p = await get((await params).handle); return p ? { title: p.title + " — Organova" } : {}; }
export default async function Product({ params }) {
  const p = await get((await params).handle);
  if (!p) notFound();
  const variants = (await db().prepare("SELECT id,title,price_pence,compare_at_pence FROM variants WHERE handle=? ORDER BY position").bind(p.handle).all()).results;
  return (
    <div className="pdp">
      <img src={p.image_url} alt={p.title} />
      <div>
        <h1>{p.title}</h1>
        <Buy product={{ handle: p.handle, title: p.title, image: p.image_url, price: p.price_pence, compare: p.compare_at_pence }} variants={variants} />
        <div dangerouslySetInnerHTML={{ __html: p.description_html }} />
      </div>
    </div>
  );
}
