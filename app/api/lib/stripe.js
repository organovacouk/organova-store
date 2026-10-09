import { env } from "./db";
function flat(o, p = "", out = []) {
  for (const [k, v] of Object.entries(o)) { if (v == null) continue; const key = p ? `${p}[${k}]` : k; typeof v === "object" ? flat(v, key, out) : out.push([key, String(v)]); }
  return out;
}
export async function stripe(path, params) {
  const r = await fetch("https://api.stripe.com/v1" + path, {
    method: "POST",
    headers: { Authorization: "Bearer " + env().STRIPE_SECRET_KEY, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(flat(params)),
  });
  return { ok: r.ok, data: await r.json() };
}
export async function verifySignature(body, header, secret) {
  const parts = Object.fromEntries((header || "").split(",").map((x) => x.split("=")));
  if (!parts.t || !parts.v1 || Math.abs(Date.now() / 1000 - +parts.t) > 300) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(parts.t + "." + body)));
  return [...sig].map((b) => b.toString(16).padStart(2, "0")).join("") === parts.v1;
}
