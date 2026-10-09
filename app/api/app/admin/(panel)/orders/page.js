import { db } from "@/lib/db";
import { money } from "@/lib/admin";
import { orderNo, itemsOf } from "@/lib/addr";
const F = { todo: "status='paid' AND fulfilment IN ('new','ordered')", shipped: "status='paid' AND fulfilment IN ('shipped','delivered')", cancelled: "fulfilment='cancelled'", failed: "status NOT IN ('paid','created')", all: "status<>'created'" };
export default async function Orders({ searchParams }) {
  const { f = "todo", q = "" } = await searchParams;
  const num = parseInt(q.replace("#", "")) - 1000;
  const rows = (await db().prepare(`SELECT * FROM orders WHERE ${F[f] || F.all} AND (?1='' OR email LIKE '%'||?1||'%' OR name LIKE '%'||?1||'%' OR id=?2) ORDER BY id DESC LIMIT 150`).bind(q, Number.isFinite(num) ? num : -1).all()).results;
  const cls = (o) => (o.status !== "paid" ? "bad" : ["new", "ordered"].includes(o.fulfilment) ? "warn" : o.fulfilment === "cancelled" ? "bad" : "good");
  return (
    <>
      <div className="top"><h1>Orders</h1><form method="get"><input type="hidden" name="f" value={f} /><input name="q" defaultValue={q} placeholder="Search name, email or #1001" style={{ width: 260 }} /></form></div>
      <div className="tabs">{[["todo", "To fulfil"], ["shipped", "Shipped"], ["cancelled", "Cancelled"], ["failed", "Failed payments"], ["all", "All"]].map(([k, l]) => <a key={k} href={"?f=" + k} className={f === k ? "on" : ""}>{l}</a>)}</div>
      <div className="card tw"><table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Via</th><th>Status</th></tr></thead><tbody>
        {rows.map((o) => <tr className="row" key={o.id}><td><a href={"/admin/orders/" + o.id}><b>{orderNo(o.id)}</b></a></td><td>{(o.paid_at || o.created_at).slice(0, 10)}</td><td>{o.name || "—"}<br /><small className="mut">{o.email}</small></td><td>{itemsOf(o.items_json).reduce((s, l) => s + l.qty, 0)}</td><td>{money(o.total_pence)}</td><td>{o.provider}</td><td><span className={"chip " + cls(o)}>{o.status === "paid" ? o.fulfilment : o.status}</span></td></tr>)}
        {!rows.length && <tr><td colSpan="7" className="mut">Nothing here.</td></tr>}</tbody></table></div>
    </>
  );
}
