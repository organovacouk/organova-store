import { db } from "@/lib/db";
import { guard } from "@/lib/admin";
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const f = await req.formData(); const n = (k, d) => { const v = parseInt(f.get(k)); return Number.isFinite(v) ? Math.min(60, Math.max(0, v)) : d; };
  let min = n("delivery_min", 7), max = n("delivery_max", 15), late = n("late_after_days", 4); if (max < min) max = min;
  for (const [k, v] of [["delivery_min", min], ["delivery_max", max], ["late_after_days", late]]) await db().prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(k, String(v)).run();
  return new Response(null, { status: 303, headers: { Location: new URL(req.url).origin + "/admin/delivery?saved=1" } });
}
