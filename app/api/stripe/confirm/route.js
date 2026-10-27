import { stripeGet, finalizeStripeSession } from "@/lib/stripe-finalise";
import { bump } from "@/lib/limit";
import { sha } from "@/lib/account";
// Called by the thank-you page, so an order is recorded even if the webhook is slow or misconfigured.
export async function POST(req) {
  const { session_id } = await req.json();
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(session_id || "")) return Response.json({ ok: false }, { status: 400 });
  const ip = (await sha(req.headers.get("cf-connecting-ip") || "x")).slice(0, 16);
  if ((await bump(`confirm:${ip}:${new Date().toISOString().slice(0, 13)}`)) > 30) return Response.json({ ok: false }, { status: 429 });
  const r = await finalizeStripeSession(await stripeGet("/checkout/sessions/" + session_id));
  return Response.json({ ok: r.ok });
}
