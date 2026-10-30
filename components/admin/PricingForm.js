"use client";
import { useState } from "react";
import { profitOf, recommend, band } from "@/lib/pricing-core";
const gbp = (p) => "£" + (p / 100).toFixed(2);
const n = (v, d = 0) => { const x = parseFloat(v); return Number.isFinite(x) ? x : d; };
export default function PricingForm({ init }) {
  const [s, setS] = useState({ feePct: String(init.feePct), feeFixed: (init.feeFixedPence / 100).toFixed(2), lossPct: String(init.lossPct), targetMargin: String(init.targetMargin), minProfit: (init.minProfitPence / 100).toFixed(2), allowance: (init.allowancePence / 100).toFixed(2), vat: init.vat, round: init.round });
  const [cost, setCost] = useState("8.00");
  const set = (k) => (e) => setS({ ...s, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const rules = { feePct: n(s.feePct), feeFixedPence: Math.round(n(s.feeFixed) * 100), lossPct: n(s.lossPct), targetMargin: n(s.targetMargin), minProfitPence: Math.round(n(s.minProfit) * 100), allowancePence: Math.round(n(s.allowance) * 100), vat: s.vat, round: s.round };
  const row = (c) => { const rec = recommend(Math.round(c * 100), rules); const r = rec ? profitOf(rec, Math.round(c * 100), rules) : null; return { c, rec, r }; };
  const main = row(n(cost));
  return (
    <div className="g2">
      <form className="card" method="post" action="/api/admin/pricing"><h2>Your pricing rules</h2>
        <div className="row2"><label>Payment fee (% of sale)<span className="h">PayPal UK is about 2.9%, Stripe cards about 1.5% to 2.5%</span><input name="feePct" value={s.feePct} onChange={set("feePct")} inputMode="decimal" /></label>
          <label>Payment fee per sale (£)<span className="h">usually £0.20 to £0.30</span><input name="feeFixed" value={s.feeFixed} onChange={set("feeFixed")} inputMode="decimal" /></label></div>
        <div className="row2"><label>Returns and disputes buffer (% of sale)<span className="h">money set aside for refunds and chargebacks</span><input name="lossPct" value={s.lossPct} onChange={set("lossPct")} inputMode="decimal" /></label>
          <label>Extra cost per order (£)<span className="h">anything not in the supplier cost</span><input name="allowance" value={s.allowance} onChange={set("allowance")} inputMode="decimal" /></label></div>
        <div className="row2"><label>Target profit margin (%)<span className="h">profit as a share of the sale price</span><input name="targetMargin" value={s.targetMargin} onChange={set("targetMargin")} inputMode="decimal" /></label>
          <label>Minimum profit per sale (£)<input name="minProfit" value={s.minProfit} onChange={set("minProfit")} inputMode="decimal" /></label></div>
        <label>Price rounding<select name="round" value={s.round} onChange={set("round")}><option value="99">End in .99 (£19.99)</option><option value="none">Round up to the next penny</option></select></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}><input type="checkbox" name="vat" value="1" checked={s.vat} onChange={set("vat")} style={{ width: "auto" }} /> I am VAT-registered (prices include 20% VAT, which is not profit)</label>
        <button className="b">Save rules</button></form>
      <div>
        <div className="card"><h2>Try it</h2>
          <label>Supplier cost (£)<input value={cost} onChange={(e) => setCost(e.target.value)} inputMode="decimal" /></label>
          {main.rec ? <p>Sell at <b>{gbp(main.rec)}</b> to make <b>{gbp(Math.round(main.r.profit))}</b> profit ({main.r.margin.toFixed(0)}% margin).</p> : <p className="err">That target margin cannot be reached with these fees. Lower the target.</p>}
          <table><thead><tr><th>Cost</th><th>Price</th><th>Profit</th><th>Margin</th></tr></thead><tbody>{[2, 5, 10, 20, 40].map((c) => { const x = row(c); return <tr key={c}><td>£{c.toFixed(2)}</td><td>{x.rec ? gbp(x.rec) : "n/a"}</td><td>{x.r ? gbp(Math.round(x.r.profit)) : ""}</td><td>{x.r ? <span className={"chip " + band(x.r.margin, rules)}>{x.r.margin.toFixed(0)}%</span> : ""}</td></tr>; })}</tbody></table></div>
        <div className="card"><h2>Good to know</h2><p className="mut">These are estimates. Check your current PayPal and Stripe fee rates, because they change. The supplier cost should include any shipping AliExpress charges you. If you are not VAT-registered, leave the box unticked. Registration is compulsory once your taxable sales pass the HMRC threshold, so it is worth checking where you stand.</p></div>
      </div>
    </div>
  );
}
