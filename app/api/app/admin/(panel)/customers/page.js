import { db } from "@/lib/db";
import { money } from "@/lib/admin";
export default async function Customers() {
  const d = db();
  const cs = (await d.prepare("SELECT LOWER(email) e, MAX(name) name, COUNT(*) n, SUM(total_pence) s, MAX(created_at) last FROM orders WHERE status='paid' AND email IS NOT NULL GROUP BY LOWER(email) ORDER BY last DESC LIMIT 200").all()).results;
  const subs = (await d.prepare("SELECT * FROM subscribers ORDER BY id DESC LIMIT 200").all()).results;
  return (<><div className="top"><h1>Customers</h1><span><a className="b o sm" href="/api/admin/export?type=customers">Export customers CSV</a> <a className="b o sm" href="/api/admin/export?type=subscribers">Export subscribers CSV</a></span></div>
    <div className="card tw"><h2>Customers who have ordered</h2><table><thead><tr><th>Name</th><th>Email</th><th>Orders</th><th>Total spent</th><th>Last order</th></tr></thead><tbody>{cs.map((c) => <tr key={c.e}><td>{c.name}</td><td><a href={"/admin/orders?f=all&q=" + encodeURIComponent(c.e)}>{c.e}</a></td><td>{c.n}</td><td>{money(c.s)}</td><td>{c.last.slice(0, 10)}</td></tr>)}{!cs.length && <tr><td colSpan="5" className="mut">No customers yet.</td></tr>}</tbody></table></div>
    <div className="card tw"><h2>Newsletter subscribers ({subs.length})</h2><table><thead><tr><th>Email</th><th>Joined</th></tr></thead><tbody>{subs.map((s) => <tr key={s.id}><td>{s.email}</td><td>{s.created_at.slice(0, 10)}</td></tr>)}{!subs.length && <tr><td colSpan="2" className="mut">No subscribers yet.</td></tr>}</tbody></table></div></>);
}
