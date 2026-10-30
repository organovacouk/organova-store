import { db } from "@/lib/db";
import { guard } from "@/lib/admin";
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const f = await req.formData(); const num = (k, min, max, d) => { const v = parseFloat(f.get(k)); return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d; };
  const vals = { feePct: num("feePct", 0, 20, 2.9), feeFixedPence: Math.round(num("feeFixed", 0, 5, 0.3) * 100), lossPct: num("lossPct", 0, 20, 3), targetMargin: num("targetMargin", 0, 80, 40), minProfitPence: Math.round(num("minProfit", 0, 100, 3) * 100), allowancePence: Math.round(num("allowance", 0, 100, 0) * 100), vat: f.get("vat") === "1" ? "1" : "0", round: f.get("round") === "none" ? "none" : "99" };
  for (const [k, v] of Object.entries(vals)) await db().prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind("pr_" + k, String(v)).run();
  return new Response(null, { status: 303, headers: { Location: new URL(req.url).origin + "/admin/pricing?saved=1" } });
}
