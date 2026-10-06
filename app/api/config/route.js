import { env } from "@/lib/db";
export async function GET() { const e = env(); return Response.json({ paypal: e.PAYPAL_CLIENT_ID || "", stripe: !!e.STRIPE_SECRET_KEY }); }
