import { db } from "@/lib/db";
export async function POST(req) {
  const j = await req.json();
  if (j.website) return Response.json({ ok: true });
  const rating = parseInt(j.rating), handle = String(j.handle || ""), email = String(j.email || "").trim().slice(0, 200);
  const name = String(j.name || "").trim().slice(0, 60), title = String(j.title || "").trim().slice(0, 100), body = String(j.body || "").trim().slice(0, 2000);
  if (!(rating >= 1 && rating <= 5) || !name || body.length < 10 || !/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Please complete your name, email, rating and review." }, { status: 400 });
  const p = await db().prepare("SELECT handle FROM products WHERE handle=?").bind(handle).first();
  if (!p) return Response.json({ error: "Unknown product" }, { status: 400 });
  const recent = await db().prepare("SELECT COUNT(*) n FROM reviews WHERE created_at > datetime('now','-1 hour')").first();
  if (recent.n >= 20) return Response.json({ error: "Too many reviews right now. Please try later." }, { status: 429 });
  const dup = await db().prepare("SELECT 1 x FROM reviews WHERE handle=? AND LOWER(email)=LOWER(?)").bind(handle, email).first();
  if (dup) return Response.json({ error: "You have already reviewed this product." }, { status: 400 });
  const v = await db().prepare("SELECT 1 x FROM orders WHERE status='paid' AND LOWER(email)=LOWER(?) AND items_json LIKE ?").bind(email, `%"handle":"${handle}"%`).first();
  await db().prepare("INSERT INTO reviews (handle,rating,title,body,name,email,verified,approved) VALUES (?,?,?,?,?,?,?,0)").bind(handle, rating, title, body, name, email, v ? 1 : 0).run();
  return Response.json({ ok: true });
}
