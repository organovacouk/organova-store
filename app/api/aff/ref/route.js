import { db } from "@/lib/db";
import { affByCode, refFromReq } from "@/lib/aff";
// With ?code= : public lookup of an active partner's offer. Without: the partner remembered by the visitor's cookie.
export async function GET(req) {
  const q = new URL(req.url).searchParams.get("code");
  const a = await affByCode(q || refFromReq(req));
  if (!a) return Response.json({});
  const hasDiscount = a.discount_pct > 0 && (await db().prepare("SELECT 1 x FROM discounts WHERE code=? AND active=1").bind(a.code).first());
  return Response.json({ code: a.code, percent: hasDiscount ? a.discount_pct : 0 });
}
