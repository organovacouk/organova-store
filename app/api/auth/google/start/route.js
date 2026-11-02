import { rand } from "@/lib/account";
import { googleConfigured, googleAuthUrl } from "@/lib/google";
export async function GET(req) {
  const u = new URL(req.url), purpose = u.searchParams.get("for") === "admin" ? "admin" : "customer";
  let next = u.searchParams.get("next") || "/account"; if (!/^\/(?!\/)/.test(next)) next = "/account";
  if (!googleConfigured()) return new Response(null, { status: 303, headers: { Location: u.origin + (purpose === "admin" ? "/admin/login?e=nogoogle" : "/account?e=nogoogle") } });
  const state = rand(16);
  return new Response(null, { status: 303, headers: { Location: googleAuthUrl(u.origin, state), "Set-Cookie": `g_oauth=${encodeURIComponent([state, purpose, next].join("|"))}; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
}
