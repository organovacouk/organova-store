import { env } from "@/lib/db";
import { getSetting } from "@/lib/admin";
export async function GET() { const e = env(); const on = (e.AI || e.ANTHROPIC_API_KEY) && (await getSetting("chat_enabled", "1")) !== "0"; return Response.json({ paypal: e.PAYPAL_CLIENT_ID || "", stripe: !!e.STRIPE_SECRET_KEY, chat: !!on }); }
