import { env } from "./db";
export const authed = (req) => { const pw = env().ADMIN_PASSWORD; if (!pw) return null; const h = req.headers.get("authorization") || ""; try { return atob(h.replace(/^Basic /, "")).split(":").slice(1).join(":") === pw; } catch { return false; } };
export const challenge = () => new Response("Login required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Organova admin"' } });
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
