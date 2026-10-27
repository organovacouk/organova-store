import { db } from "@/lib/db";
import { money } from "@/lib/admin";
import { orderNo, itemsOf } from "@/lib/addr";
import { deliveryWindow } from "@/lib/track";
export default async function Orders({ searchParams }) {
  const { f = "todo", q = "", msg, err } = await searchParams; const w = await deliveryWindow();
  const F = {
    todo: "status='paid' AND fulfilment IN ('new','ordered')",
    late: `status='paid' AND fulfilment IN ('new','ordered') AND julianday('now')-julianday(COALESCE(paid_at,created_at)) > ${w.late}`,
    shipped: "status='paid' AND fulfilment IN ('shipped','delivered')",
    cancelled: "fulfilment='cancelled' OR status='refunded'",
    unfinished: "status='created' AND created_at < datetime('now','-10 minutes')",
    failed: "status NOT IN ('paid','created','refunded')", all: "status<>'created'",
  };
  const num = parseInt(q.replace("#", "")) - 1000;
  const rows = (await db().prepare(`SELECT *, CAST(julianday('now')-julianday(COALESCE(paid_at,created_at)) AS INTEGER) age FROM orders WHERE (${F[f] || F.all}) AND (?1='' OR email LIKE '%'||?1||'%' OR name LIKE '%'||?1||'%' OR id=?2) ORDER BY id DESC LIMIT 150`).bind(q, Number.isFinite(num) ? num : -1).all()).results;
  const cls = (o) => (o.status === "created" ? "warn" : o.status !== "paid" ? "bad" : ["new", "ordered"].includes(o.fulfilment) ? "warn" : o.fulfilment === "cancelled" ? "bad" : "good");
  const tabs = [["todo", "To fulfil"], ["late", "Needs attention"], ["shipped", "Shipped"], ["unfinished", "Unfinished payments"], ["cancelled", "Refunded / cancelled"], ["failed", "Failed"], ["all", "All"]];
  return (
    <>
      <div className="top"><h1>Orders</h1><form method="get"><input type="hidden" name="f" value={f} /><input name="q" defaultValue={q} placeholder="Search name, email or #1001" style={{ width: 260 }} /></form></div>
      {msg && <p className="ok">{msg}</p>}{err && <p className="err">{err}</p>}
      <div className="tabs">{tabs.map(([k, l]) => <a key={k} href={"?f=" + k} className={f === k ? "on" : ""}>{l}</a>)}</div>
      {f === "late" && <p className="mut">Paid orders with no tracking after {w.late} days. Change this under Delivery.</p>}
      {f === "unfinished" && <p className="mut">Checkouts that were started but never recorded as paid. Click Check to ask Stripe or PayPal what really happened.</p>}
      <div className="card tw"><table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Via</th><th>Age</th><th>Status</th></tr></thead><tbody>
        {rows.map((o) => <tr className="row" key={o.id}><td><a href={"/admin/orders/" + o.id}><b>{orderNo(o.id)}</b></a></td><td>{(o.paid_at || o.created_at).slice(0, 10)}</td><td>{o.name || "—"}<br /><small className="mut">{o.email}</small></td><td>{itemsOf(o.items_json).reduce((s, l) => s + l.qty, 0)}</td><td>{money(o.total_pence)}</td><td>{o.provider}</td>
          <td>{["new", "ordered"].includes(o.fulfilment) && o.status === "paid" ? <span className={o.age > w.late ? "chip bad" : "mut"}>{o.age}d</span> : ""}</td>
          <td>{o.status === "created" ? <form method="post" action="/api/admin/reconcile"><input type="hidden" name="id" value={o.id} /><button className="b sm">Check payment</button></form> : <span className={"chip " + cls(o)}>{o.status === "paid" ? o.fulfilment : o.status}</span>}</td></tr>)}
        {!rows.length && <tr><td colSpan="8" className="mut">Nothing here.</td></tr>}</tbody></table></div>
    </>
  );
}
