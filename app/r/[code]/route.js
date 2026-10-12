import { db } from "@/lib/db";
import { affByCode } from "@/lib/aff";
export async function GET(req, { params }) {
  const { code } = await params; const u = new URL(req.url); const a = await affByCode(code);
  let to = u.searchParams.get("to") || "/"; if (!/^\/(?!\/)/.test(to)) to = "/";
  if (a) {
    await db().prepare("INSERT INTO aff_clicks (affiliate_id,day,clicks) VALUES (?,?,1) ON CONFLICT(affiliate_id,day) DO UPDATE SET clicks=clicks+1").bind(a.id, new Date().toISOString().slice(0, 10)).run();
    to += (to.includes("?") ? "&" : "?") + "ref=" + a.code;
  }
  return new Response(null, { status: 307, headers: { Location: u.origin + to, "Cache-Control": "no-store" } });
}
