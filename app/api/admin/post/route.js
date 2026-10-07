import { db } from "@/lib/db";
import { guard, slugify } from "@/lib/admin";
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const j = await req.json(); const d = db(); const bad = (m) => Response.json({ error: m }, { status: 400 });
  const title = String(j.title || "").trim().slice(0, 200), body = String(j.body || ""), excerpt = String(j.excerpt || "").trim().slice(0, 400);
  if (!title || !body.trim() || !excerpt) return bad("Title, summary and article text are all required.");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(j.published_at) ? j.published_at : new Date().toISOString().slice(0, 10);
  const img = String(j.image_url || "").trim().slice(0, 500) || null; let id = parseInt(j.id) || 0;
  if (id) await d.prepare("UPDATE posts SET title=?,excerpt=?,body=?,image_url=?,published_at=?,published=? WHERE id=?").bind(title, excerpt, body, img, date, j.published ? 1 : 0, id).run();
  else { const base = slugify(title) || "article"; let slug = base; for (let n = 2; await d.prepare("SELECT 1 x FROM posts WHERE slug=?").bind(slug).first(); n++) slug = base + "-" + n;
    id = (await d.prepare("INSERT INTO posts (slug,title,excerpt,body,image_url,published_at,published) VALUES (?,?,?,?,?,?,?)").bind(slug, title, excerpt, body, img, date, j.published ? 1 : 0).run()).meta.last_row_id; }
  return Response.json({ id });
}
