import { env } from "@/lib/db";
export async function GET() { return Response.json({ clientId: env().PAYPAL_CLIENT_ID || "" }); }
