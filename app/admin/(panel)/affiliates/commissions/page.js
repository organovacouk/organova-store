import { db } from "@/lib/db";
import { money } from "@/lib/admin";
import { orderNo } from "@/lib/addr";
export default async function Commissions({ searchParams }) {
  const { s = "pending", done } = await searchParams;
  const rows = (await db().prepare("SELECT c.*, a.name, a.code, o.created_at odate, o.fulfilment FROM commissions c JOIN affiliates a ON a.id=c.affiliate_id JOIN orders o ON o.id=c.order_id WHERE (?1='all' OR c.status=?1) ORDER BY c.id DESC LIMIT 200").bind(s).all()).results;
  const elig = (await db().prepare("SELECT COUNT(*) n FROM commissions c JOIN orders o ON o.id=c.order_id WHERE c.status='pending' AND date(c.created_at)<=date('now','-14 day') AND o.fulfilment<>'cancelled'").first()).n;
  return (<><div className="top"><div><a href="/admin/affiliates" className="mut">← Affiliates</a><h1>Commissions</h1></div>
    <form method="post" action="/api/admin/do"><input type="hidden" name="action" value="commissions_approve" /><button className="b" disabled={!elig}>Approve {elig} eligible (past 14 days)</button></form></div>
    {done && <p className="ok">Approved.</p>}
    <div className="tabs">{["pending", "approved", "paid", "cancelled", "all"].map((k) => <a key={k} href={"?s=" + k} className={s === k ? "on" : ""}>{k[0].toUpperCase() + k.slice(1)}</a>)}</div>
    <div className="card tw"><table><thead><tr><th>Date</th><th>Order</th><th>Partner</th><th>Via</th><th>Value</th><th>Commission</th><th>Status</th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.id}><td>{r.odate.slice(0, 10)}</td><td><a href={"/admin/orders/" + r.order_id}>{orderNo(r.order_id)}</a></td><td><a href={"/admin/affiliates/" + r.affiliate_id}>{r.name}</a> <span className="mut">{r.code}</span></td><td>{r.source}</td><td>{money(r.base_pence)}</td><td>{money(r.amount_pence)} <small className="mut">({r.rate_pct}%)</small></td><td><span className={"chip " + (r.status === "paid" ? "good" : r.status === "cancelled" ? "bad" : "warn")}>{r.status}</span></td></tr>)}
      {!rows.length && <tr><td colSpan="7" className="mut">Nothing here.</td></tr>}</tbody></table></div></>);
}
