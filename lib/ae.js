import { db, env } from "./db";
// AliExpress Open Platform (Dropshipping API) client: request signing, token storage (encrypted) and refresh.
const enc = new TextEncoder();
export const GW = "https://api-sg.aliexpress.com";
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const hexUpper = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
export const aeConfigured = () => !!(env().AE_APP_KEY && env().AE_APP_SECRET);
async function hmac(str) {
  const k = await crypto.subtle.importKey("raw", enc.encode(env().AE_APP_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hexUpper(await crypto.subtle.sign("HMAC", k, enc.encode(str)));
}
// Signature: HMAC-SHA256 over [api path for /rest calls] + sorted key+value pairs, upper-case hex.
const sign = (params, path = "") => hmac(path + Object.keys(params).filter((k) => k !== "sign" && params[k] != null && params[k] !== "").sort().map((k) => k + params[k]).join(""));
const aesKey = async () => crypto.subtle.importKey("raw", await crypto.subtle.digest("SHA-256", enc.encode("ae-token:" + env().AE_APP_SECRET)), "AES-GCM", false, ["encrypt", "decrypt"]);
async function seal(t) { const iv = crypto.getRandomValues(new Uint8Array(12)); const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(), enc.encode(t)); return b64(iv) + "." + b64(ct); }
async function unseal(s) { const [i, c] = s.split("."); return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(i) }, await aesKey(), unb64(c))); }
export const getS = async (k) => (await db().prepare("SELECT value FROM settings WHERE key=?").bind(k).first())?.value ?? null;
export const putS = (k, v) => db().prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(k, String(v)).run();
const parse = async (r) => { const t = await r.text(); try { return JSON.parse(t); } catch { return { raw: t.slice(0, 500), http_status: r.status }; } };
const form = (p) => ({ method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" }, body: new URLSearchParams(p) });
const base = () => ({ app_key: env().AE_APP_KEY, timestamp: String(Date.now()), sign_method: "sha256" });
// System (OAuth) calls, e.g. /auth/token/create
export async function aeSystem(path, params = {}) {
  const p = { ...base(), ...params }; p.sign = await sign(p, path);
  return parse(await fetch(GW + "/rest" + path, form(p)));
}
export async function saveTokens(res, fallbackRefresh) {
  const d = res?.data?.access_token ? res.data : res; const now = Date.now();
  if (!d?.access_token) throw new Error("AliExpress did not return a token: " + JSON.stringify(res).slice(0, 300));
  const accExp = Number(d.expire_time) || now + (Number(d.expires_in) || 3600) * 1000;
  const refExp = Number(d.refresh_token_valid_time) || now + (Number(d.refresh_expires_in) || 0) * 1000;
  await putS("ae_access", await seal(d.access_token));
  await putS("ae_refresh", await seal(d.refresh_token || fallbackRefresh || ""));
  await putS("ae_access_exp", accExp); await putS("ae_refresh_exp", refExp);
  await putS("ae_account", String(d.user_nick || d.account || d.seller_id || d.user_id || ""));
}
export async function getAccessToken() {
  const acc = await getS("ae_access"); if (!acc) throw new Error("AliExpress is not connected yet.");
  if (Number(await getS("ae_access_exp")) - Date.now() > 5 * 60 * 1000) return unseal(acc);
  const refExp = Number(await getS("ae_refresh_exp") || 0);
  if (refExp && refExp < Date.now()) throw new Error("The AliExpress connection has expired. Please reconnect.");
  const rt = await unseal(await getS("ae_refresh")); const r = await aeSystem("/auth/token/refresh", { refresh_token: rt });
  await saveTokens(r, rt); return unseal(await getS("ae_access"));
}
// Business API calls, e.g. aeCall("aliexpress.ds.product.get", { product_id, ... })
export async function aeCall(method, params = {}) {
  const p = { ...base(), access_token: await getAccessToken(), method, ...params }; p.sign = await sign(p, "");
  return parse(await fetch(GW + "/sync", form(p)));
}
export async function aeStatus() {
  const acc = await getS("ae_access");
  return { configured: aeConfigured(), connected: !!acc, account: await getS("ae_account"), accessExp: Number(await getS("ae_access_exp") || 0), refreshExp: Number(await getS("ae_refresh_exp") || 0) };
}
export const find = (o, k) => { if (!o || typeof o !== "object") return undefined; if (k in o) return o[k]; for (const v of Object.values(o)) { const f = find(v, k); if (f !== undefined) return f; } return undefined; };
export const productId = (s) => { const m = String(s).match(/item\/(\d{6,})/) || String(s).match(/(\d{8,})/); return m ? m[1] : null; };
export function summarise(r) {
  const b = find(r, "ae_item_base_info_dto"), m = find(r, "ae_multimedia_info_dto"), s = find(r, "ae_item_sku_info_dtos");
  const list = s?.ae_item_sku_info_d_t_o || s?.ae_item_sku_info_dto || (Array.isArray(s) ? s : []);
  const prices = list.map((x) => parseFloat(x.offer_sale_price ?? x.sku_price)).filter((n) => !isNaN(n));
  return { title: b?.subject || null, status: b?.product_status_type || null, currency: b?.currency_code || list[0]?.currency_code || null, rating: b?.avg_evaluation_rating || null,
    images: String(m?.image_urls || "").split(";").filter(Boolean).length, options: list.length, priceFrom: prices.length ? Math.min(...prices) : null, priceTo: prices.length ? Math.max(...prices) : null,
    stock: list.reduce((n, x) => n + (parseInt(x.sku_available_stock) || 0), 0), delivery: find(r, "delivery_time") ?? null };
}
