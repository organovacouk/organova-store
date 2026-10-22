import { db } from "@/lib/db";
import { sha, makeSession, COOKIE } from "@/lib/account";
export async function GET(req) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const row = token ? await db().prepare("SELECT email FROM login_tokens WHERE hash=? AND expires > datetime('now')").bind(await sha(token)).first() : null;
  if (!row) return new Response(null, { status: 303, headers: { Location: "/account?expired=1" } });
  await db().prepare("INSERT INTO members (email,last_login) VALUES (?,datetime('now')) ON CONFLICT(email) DO UPDATE SET last_login=datetime('now')").bind(row.email).run();
  return new Response(null, { status: 303, headers: { Location: "/account", "Set-Cookie": `${COOKIE}=${await makeSession(row.email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` } });
}
