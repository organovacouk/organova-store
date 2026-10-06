import { env } from "./db";
const base = () => (env().PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");
async function token() {
  const e = env();
  const r = await fetch(base() + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + btoa(e.PAYPAL_CLIENT_ID + ":" + e.PAYPAL_CLIENT_SECRET), "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!r.ok) throw new Error("PayPal auth failed");
  return (await r.json()).access_token;
}
export async function paypal(path, body, method = "POST") {
  const r = await fetch(base() + path, {
    method,
    headers: { Authorization: "Bearer " + (await token()), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { ok: r.ok, data: await r.json() };
}
