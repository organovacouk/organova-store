import { guard } from "@/lib/admin";
import { aeSystem, saveTokens, getS, putS } from "@/lib/ae";
// AliExpress sends the admin's browser back here with a one-time ?code= after they approve the connection.
export async function GET(req) {
  const g = await guard(req); if (g) return g; // only the signed-in admin can complete a connection
  const u = new URL(req.url); const code = u.searchParams.get("code"), state = u.searchParams.get("state");
  const to = (q) => new Response(null, { status: 303, headers: { Location: u.origin + "/admin/dropship?" + q } });
  const [s, exp] = ((await getS("ae_state")) || "").split(":");
  const live = !!s && Date.now() <= Number(exp), stateOk = live && (!state || state === s); // AliExpress may not echo state back; the admin sign-in is the main protection
  if (!code || !stateOk) return to("error=" + encodeURIComponent(`Connection not completed (code ${code ? "received" : "missing"}; state ${state ? (state === s ? "matched" : "did not match") : "not returned"}; ${!s ? "no attempt on record" : live ? "attempt on record" : "attempt expired"}). Please click Connect again and finish within 10 minutes.`));
  await putS("ae_state", "");
  try { const r = await aeSystem("/auth/token/create", { code }); await saveTokens(r); } catch (e) { return to("error=" + encodeURIComponent(String(e.message || e).slice(0, 300))); }
  return to("connected=1");
}
