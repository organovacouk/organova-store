import { env } from "./db";
export const googleConfigured = () => !!(env().GOOGLE_CLIENT_ID && env().GOOGLE_CLIENT_SECRET);
export const googleAuthUrl = (origin, state) => "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({ client_id: env().GOOGLE_CLIENT_ID, redirect_uri: origin + "/api/auth/google/callback", response_type: "code", scope: "openid email profile", state, prompt: "select_account" });
export async function googleProfile(code, origin) {
  const t = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: env().GOOGLE_CLIENT_ID, client_secret: env().GOOGLE_CLIENT_SECRET, redirect_uri: origin + "/api/auth/google/callback", grant_type: "authorization_code" }) })).json();
  if (!t.access_token) throw new Error(t.error_description || t.error || "Google did not return a token");
  const u = await (await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: "Bearer " + t.access_token } })).json();
  if (!u.email || !u.email_verified) throw new Error("Your Google email address is not verified");
  return { email: String(u.email).toLowerCase(), name: u.name || null, sub: u.sub };
}
