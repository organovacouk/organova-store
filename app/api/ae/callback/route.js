import { guard } from "@/lib/admin";
import { aeSystem, saveTokens, getS, putS } from "@/lib/ae";
// AliExpress sends the admin's browser back here with a one-time ?code= after they approve the connection.
export async function GET(req) {
  const g = await guard(req); if (g) return g; // only the signed-in admin can complete a connection
  const u = new URL(req.url); const code = u.searchParams.get("code"), state = u.searchParams.get("state");
  const to = (q) => new Response(null, { status: 303, headers: { Location: u.origin + "/admin/dropship?" + q } });
  const saved = (await getS("ae_state")) || ""; const [s, exp] = saved.split(":");
  if (!code || !state || state !== s || Date.now() > Number(exp)) return to("error=" + encodeURIComponent("That connection attempt expired or was not recognised. Please click Connect again."));
  await putS("ae_state", "");
  try { const r = await aeSystem("/auth/token/create", { code }); await saveTokens(r); } catch (e) { return to("error=" + encodeURIComponent(String(e.message || e).slice(0, 300))); }
  return to("connected=1");
}
