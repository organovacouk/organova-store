import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getRules } from "@/lib/pricing";
import ProductEditor from "@/components/admin/ProductEditor";
const pounds = (p) => (p == null ? "" : (p / 100).toFixed(2));
export default async function Edit({ params, searchParams }) {
  const { id } = await params; const { saved } = await searchParams;
  const d = db(); const rules = await getRules();
  const cats = (await d.prepare("SELECT DISTINCT product_type t FROM products WHERE product_type<>'' ORDER BY t").all()).results.map((c) => c.t);
  let init = { id: null, title: "", handle: "", category: "", status: "active", available: 1, price: "", compare: "", cost: "", vendor: "Organova", tags: "", supplier_url: "", description: "", images: [], variants: [] };
  if (id !== "new") {
    const p = await d.prepare("SELECT * FROM products WHERE id=?").bind(parseInt(id) || 0).first(); if (!p) notFound();
    const vs = (await d.prepare("SELECT title,price_pence,compare_at_pence,cost_pence FROM variants WHERE handle=? ORDER BY position").bind(p.handle).all()).results;
    let images = []; try { images = JSON.parse(p.images_json || "[]"); } catch {} if (!images.length && p.image_url) images = [p.image_url];
    init = { id: p.id, title: p.title, handle: p.handle, category: p.product_type, status: p.status, available: p.available, price: pounds(p.price_pence), compare: pounds(p.compare_at_pence), cost: pounds(p.cost_pence), vendor: p.vendor || "", tags: p.tags || "", supplier_url: p.supplier_url || "", description: p.description_html || "", images, variants: vs.map((v) => ({ title: v.title, price: pounds(v.price_pence), compare: pounds(v.compare_at_pence), cost: pounds(v.cost_pence) })) };
  }
  return (<><div className="top"><div><a href="/admin/products" className="mut">← Products</a><h1>{init.id ? "Edit product" : "Add product"}</h1></div>{init.id && <a className="b o" href={"/products/" + init.handle} target="_blank">View on store ↗</a>}</div>
    {saved && <p className="ok">Saved.</p>}<ProductEditor init={init} categories={cats} rules={rules} /></>);
}
