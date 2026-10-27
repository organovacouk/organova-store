import { env } from "@/lib/db";
import { verifySignature } from "@/lib/stripe";
import { finalizeStripeSession, stripeGet } from "@/lib/stripe-finalise";
export async function POST(req) {
  const body = await req.text();
  if (!(await verifySignature(body, req.headers.get("stripe-signature"), env().STRIPE_WEBHOOK_SECRET))) return new Response("bad signature", { status: 400 });
  const ev = JSON.parse(body);
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(ev.type)) return Response.json({ received: true });
  const id = ev.data?.object?.id || ev.related_object?.id;
  const s = ev.data?.object?.object === "checkout.session" ? ev.data.object : id ? await stripeGet("/checkout/sessions/" + encodeURIComponent(id)) : null;
  await finalizeStripeSession(s);
  return Response.json({ received: true });
}
