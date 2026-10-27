import { db } from "@/lib/db";
import { trackView } from "@/lib/track";
import { bump } from "@/lib/limit";
import { sha } from "@/lib/account";
export async function POST(req) {
  const j = await req.json();
  const ip = (await sha(req.headers.get("cf-connecting-ip") || "x")).slice(0, 16);
  if ((await bump(`track:${ip}:${new Date().toISOString().slice(0, 13)}`)) > 20) return Response.json({ error: "Too many tries. Please wait a while and try again." }, { status: 429 });
  const id = parseInt(String(j.order || "").replace(/[^0-9]/g, "")) - 1000, email = String(j.email || "").trim().toLowerCase();
  const o = id > 0 && email ? await db().prepare("SELECT * FROM orders WHERE id=? AND LOWER(email)=? AND status IN ('paid','refunded')").bind(id, email).first() : null;
  if (!o) return Response.json({ error: "We could not find that order. Please check the order number and the email you used." }, { status: 404 });
  return Response.json(await trackView(o));
}
