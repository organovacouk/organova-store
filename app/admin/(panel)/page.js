import { db } from "@/lib/db";
import { money } from "@/lib/admin";
import { orderNo, itemsOf } from "@/lib/addr";
export default async function Dashboard() {
  const d = db();
  const sum = async (where) => d.prepare(`SELECT COUNT(*) n, COALESCE(SUM(total_pence),0) s FROM orders WHERE status='paid' ${where}`).first();
  const [t, w, m, all] = await Promise.all([sum("AND date(created_at)=date('now')"), sum("AND date(created_at)>=date('now','-6 day')"), sum("AND date(created_at)>=date('now','-29 day')"), sum("")]);
  const days = (await d.prepare("SELECT date(created_at) d, SUM(total_pence) s, COUNT(*) n FROM orders WHERE status='paid' AND date(created_at)>=date('now','-13 day') GROUP BY d").all()).results;
  const map = Object.fromEntries(days.map((r) => [r.d, r]));
  const series = [...Array(14)].map((_, i) => { const k = new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10); return { k, s: map[k]?.s || 0, n: map[k]?.n || 0 }; });
  const max = Math.max(1, ...series.map((x) => x.s));
  const recent = (await d.prepare("SELECT * FROM orders WHERE status='paid' ORDER BY id DESC LIMIT 6").all()).results;
  const last = (await d.prepare("SELECT items_json FROM orders WHERE status='paid' ORDER BY id DESC LIMIT 300").all()).results;
  const top = {}; for (const o of last) for (const l of itemsOf(o.items_json)) top[l.title] = (top[l.title] || 0) + l.qty;
  const topList = Object.entries(top).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const c = async (q) => (await d.prepare(q).first()).n;
  const [todo, rv, ms, subs, act, draft, out] = await Promise.all([c("SELECT COUNT(*) n FROM orders WHERE status='paid' AND fulfilment IN ('new','ordered')"), c("SELECT COUNT(*) n FROM reviews WHERE approved=0"), c("SELECT COUNT(*) n FROM messages WHERE handled=0"), c("SELECT COUNT(*) n FROM subscribers"), c("SELECT COUNT(*) n FROM products WHERE status='active'"), c("SELECT COUNT(*) n FROM products WHERE status<>'active'"), c("SELECT COUNT(*) n FROM products WHERE status='active' AND available=0")]);
  const aov = all.n ? Math.round(all.s / all.n) : 0;
  return (
    <>
      <div className="top"><h1>Dashboard</h1><a className="b" href="/admin/products/new">+ Add product</a></div>
      <div className="stats">
        <div className="stat"><small>Sales today</small><b>{money(t.s)}</b><small>{t.n} orders</small></div>
        <div className="stat"><small>Last 7 days</small><b>{money(w.s)}</b><small>{w.n} orders</small></div>
        <div className="stat"><small>Last 30 days</small><b>{money(m.s)}</b><small>{m.n} orders</small></div>
        <div className="stat"><small>Average order</small><b>{money(aov)}</b><small>{all.n} orders all time</small></div>
      </div>
      <div className="stats">
        <a className={"stat" + (todo ? " hl" : "")} href="/admin/orders?f=todo"><small>Orders to fulfil</small><b>{todo}</b></a>
        <a className="stat" href="/admin/reviews"><small>Reviews to approve</small><b>{rv}</b></a>
        <a className="stat" href="/admin/messages"><small>Unanswered messages</small><b>{ms}</b></a>
        <a className="stat" href="/admin/customers"><small>Newsletter subscribers</small><b>{subs}</b></a>
      </div>
      <div className="g2">
        <div className="card"><h2>Sales, last 14 days</h2>
          <div className="bars">{series.map((x) => <div key={x.k} style={{ height: (x.s / max) * 100 + "%" }} data-t={`${x.k}: ${money(x.s)} (${x.n})`} />)}</div>
          <div className="barl">{series.map((x, i) => <span key={x.k}>{i % 2 === 0 ? x.k.slice(8) : ""}</span>)}</div></div>
        <div className="card"><h2>Catalogue</h2><p><b>{act}</b> live · <b>{draft}</b> draft/archived · <b>{out}</b> sold out</p><a className="b o sm" href="/admin/products">Manage products</a>
          <h2 style={{ marginTop: 18 }}>Best sellers</h2>{topList.length ? <table><tbody>{topList.map(([t, n]) => <tr key={t}><td>{t.slice(0, 48)}</td><td>{n}</td></tr>)}</tbody></table> : <p className="mut">No sales yet.</p>}</div>
      </div>
      <div className="card"><div className="top" style={{ margin: 0 }}><h2>Recent orders</h2><a href="/admin/orders">View all</a></div>
        <div className="tw"><table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{recent.map((o) => <tr className="row" key={o.id}><td><a href={"/admin/orders/" + o.id}>{orderNo(o.id)}</a></td><td>{(o.paid_at || o.created_at).slice(0, 10)}</td><td>{o.name || o.email}</td><td>{money(o.total_pence)}</td><td><span className={"chip " + (["new", "ordered"].includes(o.fulfilment) ? "warn" : o.fulfilment === "cancelled" ? "bad" : "good")}>{o.fulfilment}</span></td></tr>)}</tbody></table></div></div>
    </>
  );
}
