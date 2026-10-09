import { db } from "@/lib/db";
import { SEL } from "@/lib/q";
import { card } from "@/lib/search";
export async function GET(req) {
  const hs = (new URL(req.url).searchParams.get("h") || "").split(",").filter((h) => /^[a-z0-9-]+$/.test(h)).slice(0, 24);
  if (!hs.length) return Response.json([]);
  const rows = (await db().prepare(`${SEL} AND p.handle IN (${hs.map(() => "?").join(",")})`).bind(...hs).all()).results;
  const by = Object.fromEntries(rows.map((r) => [r.handle, r]));
  return Response.json(hs.filter((h) => by[h]).map((h) => card(by[h])));
}
