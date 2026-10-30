import { db } from "./db";
import { normRules } from "./pricing-core";
export { profitOf, recommend, band, DEFAULT_RULES } from "./pricing-core";
export async function getRules() {
  const rows = (await db().prepare("SELECT key,value FROM settings WHERE key LIKE 'pr_%'").all()).results; const m = Object.fromEntries(rows.map((r) => [r.key.slice(3), r.value]));
  const n = (k) => (m[k] !== undefined && m[k] !== "" ? parseFloat(m[k]) : undefined);
  return normRules({ feePct: n("feePct"), feeFixedPence: n("feeFixedPence"), lossPct: n("lossPct"), targetMargin: n("targetMargin"), minProfitPence: n("minProfitPence"), allowancePence: n("allowancePence"), vat: m.vat === "1", round: m.round || undefined });
}
