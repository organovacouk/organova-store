import { db } from "@/lib/db";
import { money } from "@/lib/admin";
import { getRules, profitOf, band } from "@/lib/pricing";
import { orderNo, itemsOf } from "@/lib/addr";
export default async function Profit() {
  const d = db(); const rules = await getRules(); const vatF = rules.vat ? 1.2 : 1;
  const orders = (await d.prepare("SELECT id,total_pence,refunded_pence,items_json,created_at,paid_at,provider FROM orders WHERE status='paid' ORDER BY id DESC LIMIT 500").all()).results;
  const calc = (o) => {
    const lines = itemsOf(o.items_json); const known = lines.every((l) => l.cost_pence != null); const cost = lines.reduce((s, l) => s + (l.cost_pence || 0) * l.qty, 0);
    const rev = o.total_pence - (o.refunded_pence || 0), net = rev / vatF, fees = o.total_pence * (rules.feePct / 100) + rules.feeFixedPence;
    return { rev, net, cost, fees, profit: net - cost - fees - rules.allowancePence, known, date: (o.paid_at || o.created_at).slice(0, 10), id: o.id };
  };
  const all = orders.map(calc), cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const sum = (list) => { const k = list.filter((x) => x.known); const t = (f) => k.reduce((s, x) => s + f(x), 0); const net = t((x) => x.net); return { n: list.length, counted: k.length, rev: t((x) => x.rev), cost: t((x) => x.cost), fees: t((x) => x.fees), profit: t((x) => x.profit), margin: net > 0 ? (t((x) => x.profit) / net) * 100 : 0 }; };
  const m = sum(all.filter((x) => x.date >= cutoff)), a = sum(all);
  const prods = (await d.prepare("SELECT p.title, p.price_pence, p.cost_pence, p.id FROM products p WHERE p.status='active' AND p.cost_pence IS NOT NULL AND NOT EXISTS (SELECT 1 FROM variants v WHERE v.handle=p.handle)").all()).results;
  const vars = (await d.prepare("SELECT p.title, v.title vt, v.price_pence, v.cost_pence, p.id FROM variants v JOIN products p ON p.handle=v.handle WHERE p.status='active' AND v.cost_pence IS NOT NULL").all()).results;
  const items = [...prods.map((p) => ({ id: p.id, name: p.title, price: p.price_pence, cost: p.cost_pence })), ...vars.map((v) => ({ id: v.id, name: `${v.title} (${v.vt})`, price: v.price_pence, cost: v.cost_pence }))].map((x) => ({ ...x, r: profitOf(x.price, x.cost, rules) })).sort((x, y) => x.r.margin - y.r.margin);
  const missing = (await d.prepare("SELECT COUNT(*) n FROM products p WHERE p.status='active' AND p.cost_pence IS NULL AND NOT EXISTS (SELECT 1 FROM variants v WHERE v.handle=p.handle) AND NOT EXISTS (SELECT 1 FROM variants v WHERE v.handle=p.handle AND v.cost_pence IS NOT NULL)").first()).n;
  const card = (t, s) => (<div className="card"><h2>{t}</h2><div className="stats" style={{ margin: 0 }}><div className="stat"><small>Revenue</small><b>{money(s.rev)}</b></div><div className="stat"><small>Supplier cost</small><b>{money(s.cost)}</b></div><div className="stat"><small>Payment fees</small><b>{money(Math.round(s.fees))}</b></div><div className={"stat" + (s.profit < 0 ? " hl" : "")}><small>Estimated profit</small><b>{money(Math.round(s.profit))}</b></div><div className="stat"><small>Margin</small><b>{s.margin.toFixed(0)}%</b></div></div>
    <p className="mut" style={{ marginBottom: 0 }}>{s.n} orders, {s.counted} with supplier costs recorded{s.n > s.counted ? `. ${s.n - s.counted} are left out because they have no cost data (older orders, or products without a cost).` : "."}</p></div>);
  return (
    <>
      <div className="top"><h1>Profit</h1><a className="b o" href="/admin/pricing">Pricing rules</a></div>
      {card("Last 30 days", m)}{card("All time", a)}
      {missing > 0 && <p className="err">{missing} live products have no supplier cost yet, so their profit is unknown. Add costs in <a href="/admin/products">Products</a> (or via the AliExpress import).</p>}
      <div className="card tw"><h2>Lowest-margin products</h2><p className="mut">At today's prices. Anything red is losing money or close to it.</p>
        <table><thead><tr><th>Product</th><th>Price</th><th>Cost</th><th>Profit</th><th>Margin</th></tr></thead><tbody>{items.slice(0, 20).map((x, i) => <tr key={i}><td><a href={"/admin/products/" + x.id}>{x.name.slice(0, 70)}</a></td><td>{money(x.price)}</td><td>{money(x.cost)}</td><td>{money(Math.round(x.r.profit))}</td><td><span className={"chip " + band(x.r.margin, rules)}>{x.r.margin.toFixed(0)}%</span></td></tr>)}{!items.length && <tr><td colSpan="5" className="mut">Add supplier costs to your products to see this.</td></tr>}</tbody></table></div>
      <div className="card tw"><h2>Recent orders</h2><table><thead><tr><th>Order</th><th>Date</th><th>Revenue</th><th>Cost</th><th>Fees</th><th>Profit</th></tr></thead><tbody>{all.slice(0, 25).map((x) => <tr key={x.id}><td><a href={"/admin/orders/" + x.id}>{orderNo(x.id)}</a></td><td>{x.date}</td><td>{money(x.rev)}</td><td>{x.known ? money(x.cost) : <span className="mut">unknown</span>}</td><td>{money(Math.round(x.fees))}</td><td>{x.known ? money(Math.round(x.profit)) : <span className="mut">unknown</span>}</td></tr>)}</tbody></table></div>
    </>
  );
}
