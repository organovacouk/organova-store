import { db } from "@/lib/db";
import { guard } from "@/lib/admin";
const q = (v) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
export async function GET(req) {
  const g = await guard(req); if (g) return g;
  const type = new URL(req.url).searchParams.get("type");
  let rows = [], head = [];
  if (type === "subscribers") { head = ["email", "joined"]; rows = (await db().prepare("SELECT email, created_at FROM subscribers ORDER BY id").all()).results.map((r) => [r.email, r.created_at]); }
  else { head = ["email", "name", "orders", "total_gbp", "last_order"]; rows = (await db().prepare("SELECT LOWER(email) e, MAX(name) n, COUNT(*) c, SUM(total_pence) s, MAX(created_at) l FROM orders WHERE status='paid' AND email IS NOT NULL GROUP BY LOWER(email)").all()).results.map((r) => [r.e, r.n, r.c, (r.s / 100).toFixed(2), r.l]); }
  return new Response([head, ...rows].map((r) => r.map(q).join(",")).join("\n"), { headers: { "content-type": "text/csv", "content-disposition": `attachment; filename="${type || "customers"}.csv"` } });
}
