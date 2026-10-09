import { db } from "@/lib/db";
export async function POST(req) {
  const j = await req.json();
  if (j.website) return Response.json({ ok: true });
  const email = String(j.email || "").trim().slice(0, 200);
  if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Invalid email" }, { status: 400 });
  const recent = await db().prepare("SELECT COUNT(*) n FROM subscribers WHERE created_at > datetime('now','-1 hour')").first();
  if (recent.n >= 100) return Response.json({ error: "Busy" }, { status: 429 });
  await db().prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").bind(email).run();
  return Response.json({ ok: true });
}
