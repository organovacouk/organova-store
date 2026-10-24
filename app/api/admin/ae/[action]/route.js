import { env } from "@/lib/db";
import { guard, back } from "@/lib/admin";
import { rand } from "@/lib/account";
import { GW, aeConfigured, aeCall, aeSystem, getAccessToken, getS, putS, productId, summarise, saveTokens } from "@/lib/ae";
import { db } from "@/lib/db";
export async function GET(req, { params }) {
  const g = await guard(req); if (g) return g;
  const { action } = await params; const origin = new URL(req.url).origin;
  if (action === "connect") {
    if (!aeConfigured()) return new Response(null, { status: 303, headers: { Location: origin + "/admin/dropship?error=" + encodeURIComponent("Add AE_APP_KEY and AE_APP_SECRET first.") } });
    const state = rand(16); await putS("ae_state", state + ":" + (Date.now() + 10 * 60 * 1000));
    const url = `${GW}/oauth/authorize?response_type=code&force_auth=true&client_id=${encodeURIComponent(env().AE_APP_KEY)}&redirect_uri=${encodeURIComponent(origin + "/api/ae/callback")}&state=${state}`;
    return new Response(null, { status: 303, headers: { Location: url } });
  }
  return new Response("Not found", { status: 404 });
}
export async function POST(req, { params }) {
  const g = await guard(req); if (g) return g;
  const { action } = await params;
  if (action === "disconnect") { await db().prepare("DELETE FROM settings WHERE key IN ('ae_access','ae_refresh','ae_access_exp','ae_refresh_exp','ae_account','ae_state')").run(); return back(req, "/admin/dropship"); }
  if (action === "refresh") {
    try { const rt = await getS("ae_refresh"); if (!rt) throw new Error("Not connected"); await putS("ae_access_exp", "0"); await getAccessToken(); } catch (e) { return new Response(null, { status: 303, headers: { Location: new URL(req.url).origin + "/admin/dropship?error=" + encodeURIComponent(String(e.message || e).slice(0, 200)) } }); }
    return back(req, "/admin/dropship");
  }
  if (action === "test") {
    const j = await req.json(); const id = productId(j.input || "");
    if (!id) return Response.json({ ok: false, error: "Could not find a product ID in that. Paste an AliExpress product link or number." });
    try {
      const raw = await aeCall("aliexpress.ds.product.get", { product_id: id, ship_to_country: "GB", target_currency: "GBP", target_language: "en" });
      const summary = summarise(raw);
      return Response.json({ ok: !!summary.title, id, summary, raw: JSON.stringify(raw, null, 1).slice(0, 6000) });
    } catch (e) { return Response.json({ ok: false, error: String(e.message || e) }); }
  }
  return new Response("Not found", { status: 404 });
}
