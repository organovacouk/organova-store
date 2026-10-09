import { db } from "./db";
import { SEL } from "./q";
const STOP = new Set(["the", "and", "for", "with", "that", "this", "you", "have", "need", "want", "some", "any", "can", "what", "are", "was", "does", "your", "from", "get", "into", "about", "looking", "please", "help", "best", "good", "nice"]);
const stem = (w) => (w.endsWith("ves") ? w.slice(0, -3) + "f" : w.endsWith("ies") ? w.slice(0, -3) + "y" : w.endsWith("s") && !w.endsWith("ss") && w.length > 3 ? w.slice(0, -1) : w);
export const terms = (q) => [...new Set(String(q).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem))].slice(0, 6);
export async function search(q, limit = 12) {
  const ts = terms(q); if (!ts.length) return [];
  const sc = ts.map((_, i) => `(CASE WHEN LOWER(p.title) LIKE ?${i + 1} THEN 3 ELSE 0 END + CASE WHEN LOWER(p.tags) LIKE ?${i + 1} THEN 2 ELSE 0 END + CASE WHEN LOWER(p.product_type) LIKE ?${i + 1} THEN 2 ELSE 0 END + CASE WHEN LOWER(p.description_html) LIKE ?${i + 1} THEN 1 ELSE 0 END)`).join(" + ");
  return (await db().prepare(`${SEL} AND (${sc}) > 0 ORDER BY (${sc}) DESC, p.available DESC, p.id LIMIT ${parseInt(limit)}`).bind(...ts.map((t) => "%" + t + "%")).all()).results;
}
export const card = (p) => ({ handle: p.handle, title: p.title, price: p.nv ? p.minp : p.price_pence, compare: p.nv ? null : p.compare_at_pence, image: p.image_url, available: p.available, from: !!p.nv });
