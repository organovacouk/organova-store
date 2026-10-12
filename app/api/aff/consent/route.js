import { affByCode } from "@/lib/aff";
export async function POST(req) {
  const { code } = await req.json(); const a = await affByCode(code);
  if (!a) return Response.json({ error: "Unknown partner" }, { status: 400 });
  return new Response(JSON.stringify({ ok: true, code: a.code, percent: a.discount_pct }), { headers: { "content-type": "application/json", "Set-Cookie": `org_ref=${a.code}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 86400}` } });
}
