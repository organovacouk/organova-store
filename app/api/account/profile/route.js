import { db } from "@/lib/db";
import { readSession, COOKIE } from "@/lib/account";
export async function POST(req) {
  const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]+)"));
  const email = await readSession(m?.[1]);
  if (!email) return Response.json({ error: "Please sign in again." }, { status: 401 });
  const j = await req.json(); const name = String(j.name || "").trim().slice(0, 80), mk = j.marketing ? 1 : 0;
  await db().prepare("UPDATE members SET name=?, marketing=? WHERE email=?").bind(name || null, mk, email).run();
  if (mk) await db().prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").bind(email).run();
  else await db().prepare("DELETE FROM subscribers WHERE email=?").bind(email).run();
  return Response.json({ ok: true });
}
