// Pure pricing maths, used on the server and in the browser. Amounts are in pence unless stated.
export const DEFAULT_RULES = { feePct: 2.9, feeFixedPence: 30, lossPct: 3, vat: false, targetMargin: 40, minProfitPence: 300, allowancePence: 0, round: "99" };
export const normRules = (r = {}) => ({ ...DEFAULT_RULES, ...Object.fromEntries(Object.entries(r).filter(([, v]) => v !== undefined && v !== null && !Number.isNaN(v))) });
// Profit on a sale at `grossPence` (what the customer pays) with `costPence` supplier cost.
export function profitOf(grossPence, costPence, rules) {
  const r = normRules(rules), vatF = r.vat ? 1.2 : 1, net = grossPence / vatF;
  const fees = (grossPence * (r.feePct + r.lossPct)) / 100 + r.feeFixedPence;
  const profit = net - costPence - r.allowancePence - fees;
  return { net, fees, profit, margin: net > 0 ? (profit / net) * 100 : 0 };
}
// Price (pence) that achieves the target margin and minimum profit, rounded up to x.99. Null if the target cannot be reached.
export function recommend(costPence, rules) {
  const r = normRules(rules), vatF = r.vat ? 1.2 : 1, pct = ((r.feePct + r.lossPct) / 100) * vatF, m = r.targetMargin / 100;
  const base = costPence + r.allowancePence + r.feeFixedPence, den = 1 - pct - m;
  if (!(costPence > 0) || den <= 0.05) return null;
  const net = Math.max(base / den, (base + r.minProfitPence) / (1 - pct)); let gross = net * vatF;
  if (r.round === "99") { let c = Math.floor(gross / 100) * 100 + 99; if (c < gross) c += 100; gross = c; } else gross = Math.ceil(gross);
  return Math.round(gross);
}
export const band = (margin, rules) => (margin < 0 ? "bad" : margin < normRules(rules).targetMargin * 0.7 ? "warn" : "good");
