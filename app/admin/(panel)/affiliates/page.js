import { db } from "@/lib/db";
import { money } from "@/lib/admin";
export default async function Affiliates({ searchParams }) {
  const sp = await searchParams; const d = db();
  const pend = (await d.prepare("SELECT COUNT(*) n FROM affiliates WHERE status='pending'").first()).n;
  const s = sp.s || (pend ? "pending" : "active");
  const rows = (await d.prepare(`SELECT a.*, (SELECT COUNT(*) FROM commissions c WHERE c.affiliate_id=a.id AND c.status<>'cancelled') orders, (SELECT COALESCE(SUM(base_pence),0) FROM commissions c WHERE c.affiliate_id=a.id AND c.status<>'cancelled') sales, (SELECT COALESCE(SUM(amount_pence),0) FROM commissions c WHERE c.affiliate_id=a.id AND c.status='approved') owed, (SELECT COALESCE(SUM(amount_pence),0) FROM commissions c WHERE c.affiliate_id=a.id AND c.status='pending') pending, (SELECT COALESCE(SUM(clicks),0) FROM aff_clicks k WHERE k.affiliate_id=a.id AND k.day>=date('now','-29 day')) clicks FROM affiliates a WHERE (?1='all' OR a.status=?1) ORDER BY a.id DESC`).bind(s).all()).results;
  const t = await d.prepare("SELECT COALESCE(SUM(CASE WHEN status='approved' THEN amount_pence END),0) owed, COALESCE(SUM(CASE WHEN status='pending' THEN amount_pence END),0) pending, COALESCE(SUM(CASE WHEN status='paid' THEN amount_pence END),0) paid, COALESCE(SUM(CASE WHEN status<>'cancelled' THEN base_pence END),0) sales FROM commissions").first();
  const act = (await d.prepare("SELECT COUNT(*) n FROM affiliates WHERE status='active'").first()).n;
  return (
    <>
      <div className="top"><h1>Affiliates</h1><a className="b o" href="/admin/affiliates/commissions">All commissions</a></div>
      {sp.err && <p className="err">That code is not valid or is already used by another partner or discount. Use 3 to 20 letters or numbers.</p>}
      <div className="stats"><div className="stat"><small>Active partners</small><b>{act}</b></div><div className="stat"><small>Sales referred</small><b>{money(t.sales)}</b></div><div className={"stat" + (t.owed ? " hl" : "")}><small>Ready to pay out</small><b>{money(t.owed)}</b></div><div className="stat"><small>Pending (14-day window)</small><b>{money(t.pending)}</b></div><div className="stat"><small>Paid to date</small><b>{money(t.paid)}</b></div></div>
      <div className="tabs">{[["pending", "Applications"], ["active", "Active"], ["suspended", "Suspended"], ["rejected", "Rejected"], ["all", "All"]].map(([k, l]) => <a key={k} href={"?s=" + k} className={s === k ? "on" : ""}>{l}{k === "pending" && pend > 0 ? ` (${pend})` : ""}</a>)}</div>
      {s === "pending" ? rows.map((a) => (
        <div className="card" key={a.id}><h2>{a.name} <span className="mut" style={{ fontWeight: 400, fontSize: 14 }}>{a.email}</span></h2>
          <p><b>Where they share:</b> {a.website}</p><p style={{ whiteSpace: "pre-wrap" }}><b>Plan:</b> {a.promo}</p><p className="mut">PayPal: {a.payout_email} · applied {a.created_at.slice(0, 10)}</p>
          <form method="post" action="/api/admin/do" className="row3" style={{ alignItems: "end" }}><input type="hidden" name="action" value="aff_approve" /><input type="hidden" name="id" value={a.id} />
            <label>Code (their link and discount code)<input name="code" defaultValue={a.code} required pattern="[A-Za-z0-9]{3,20}" /></label><label>Commission %<input name="commission" type="number" min="1" max="50" defaultValue="10" /></label><label>Customer discount %<input name="discount" type="number" min="0" max="50" defaultValue="10" /></label>
            <button className="b">Approve</button></form>
          <form method="post" action="/api/admin/do" style={{ marginTop: 8 }}><input type="hidden" name="action" value="aff_reject" /><input type="hidden" name="id" value={a.id} /><button className="b o sm">Decline</button></form></div>))
        : <div className="card tw"><table><thead><tr><th>Partner</th><th>Code</th><th>Clicks 30d</th><th>Orders</th><th>Sales</th><th>Pending</th><th>Ready to pay</th><th>Status</th></tr></thead><tbody>
          {rows.map((a) => <tr className="row" key={a.id}><td><a href={"/admin/affiliates/" + a.id}><b>{a.name}</b></a><br /><small className="mut">{a.email}</small></td><td>{a.code}</td><td>{a.clicks}</td><td>{a.orders}</td><td>{money(a.sales)}</td><td>{money(a.pending)}</td><td><b>{money(a.owed)}</b></td><td><span className={"chip " + (a.status === "active" ? "good" : a.status === "pending" ? "warn" : "bad")}>{a.status}</span></td></tr>)}
          {!rows.length && <tr><td colSpan="8" className="mut">Nobody here yet. Share <b>/partners</b> to recruit partners.</td></tr>}</tbody></table></div>}
      {s === "pending" && !rows.length && <div className="card mut">No applications waiting.</div>}
    </>
  );
}
