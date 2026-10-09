import { db } from "@/lib/db";
import { sha, makeSession, COOKIE } from "@/lib/account";
export async function GET(req) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const row = token ? await db().prepare("SELECT email FROM login_tokens WHERE hash=? AND expires > datetime('now')").bind(await sha(token)).first() : null;
  if (!row) return new Response(null, { status: 303, headers: { Location: "/account?expired=1" } });
  return new Response(null, { status: 303, headers: { Location: "/account", "Set-Cookie": `${COOKIE}=${await makeSession(row.email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` } });
}
