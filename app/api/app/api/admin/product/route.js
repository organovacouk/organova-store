import { db } from "@/lib/db";
import { guard, pence, slugify } from "@/lib/admin";
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const j = await req.json(); const d = db(); const bad = (m) => Response.json({ error: m }, { status: 400 });
  const title = String(j.title || "").trim().slice(0, 200), cat = String(j.category || "").trim().slice(0, 60);
  if (!title) return bad("Please enter a title."); if (!cat) return bad("Please choose or type a category.");
  const images = (j.images || []).filter((u) => typeof u === "string" && u).slice(0, 12); if (!images.length) return bad("Please add at least one image.");
  const variants = (j.variants || []).map((v) => ({ title: String(v.title || "").trim().slice(0, 120), price: pence(v.price), compare: String(v.compare || "").trim() ? pence(v.compare) : null }));
  for (const v of variants) if (!v.title || !(v.price > 0)) return bad("Every option needs a name and a price.");
  let price = variants.length ? Math.min(...variants.map((v) => v.price)) : pence(j.price); if (!(price > 0)) return bad("Please enter a valid price.");
  const compare = String(j.compare || "").trim() ? pence(j.compare) : null; if (compare != null && !(compare > 0)) return bad("Compare-at price is not valid.");
  const status = ["active", "draft", "archived"].includes(j.status) ? j.status : "active";
  const supplier = /^https?:\/\//.test(String(j.supplier_url || "")) ? String(j.supplier_url).slice(0, 500) : null;
  const vals = [title, String(j.description || ""), cat, String(j.vendor || "").slice(0, 80), String(j.tags || "").slice(0, 300), price, compare, images[0], JSON.stringify(images), status, j.available ? 1 : 0, supplier];
  let id = parseInt(j.id) || 0, handle;
  if (id) {
    const p = await d.prepare("SELECT handle FROM products WHERE id=?").bind(id).first(); if (!p) return bad("Product not found.");
    handle = p.handle;
    await d.prepare("UPDATE products SET title=?,description_html=?,product_type=?,vendor=?,tags=?,price_pence=?,compare_at_pence=?,image_url=?,images_json=?,status=?,available=?,supplier_url=? WHERE id=?").bind(...vals, id).run();
  } else {
    const base = slugify(title) || "product"; handle = base; for (let n = 2; await d.prepare("SELECT 1 x FROM products WHERE handle=?").bind(handle).first(); n++) handle = base + "-" + n;
    const r = await d.prepare("INSERT INTO products (handle,title,description_html,product_type,vendor,tags,price_pence,compare_at_pence,image_url,images_json,status,available,supplier_url,gallery_done) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)").bind(handle, ...vals).run();
    id = r.meta.last_row_id;
  }
  await d.prepare("DELETE FROM variants WHERE handle=?").bind(handle).run();
  for (let i = 0; i < variants.length; i++) await d.prepare("INSERT INTO variants (handle,title,price_pence,compare_at_pence,position) VALUES (?,?,?,?,?)").bind(handle, variants[i].title, variants[i].price, variants[i].compare, i + 1).run();
  return Response.json({ id });
}
