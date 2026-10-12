import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { money } from "@/lib/admin";
import { affStats } from "@/lib/aff";
import { orderNo } from "@/lib/addr";
import CopyBtn from "@/components/CopyBtn";
export default async function Aff({ params }) {
  const { id } = await params; const d = db();
  const a = await d.prepare("SELECT * FROM affiliates WHERE id=?").bind(parseInt(id) || 0).first(); if (!a) notFound();
  const s = await affStats(a.id); const host = (await headers()).get("host");
  const rows = (await d.prepare("SELECT c.*, o.created_at odate FROM commissions c JOIN orders o ON o.id=c.order_id WHERE c.affiliate_id=? ORDER BY c.id DESC LIMIT 100").bind(a.id).all()).results;
  const pays = (await d.prepare("SELECT * FROM aff_payouts WHERE affiliate_id=? ORDER BY id DESC").bind(a.id).all()).results;
  const dash = `https://${host}/partners/dashboard/${a.token}`;
  return (
    <>
      <div className="top"><div><a href="/admin/affiliates" className="mut">← Affiliates</a><h1>{a.name}</h1></div><span className={"chip " + (a.status === "active" ? "good" : a.status === "pending" ? "warn" : "bad")}>{a.status}</span></div>
      <div className="stats"><div className="stat"><small>Clicks (30 days)</small><b>{s.clicks30}</b></div><div className="stat"><small>Orders</small><b>{s.orders}</b></div><div className="stat"><small>Sales referred</small><b>{money(s.sales)}</b></div><div className="stat"><small>Pending</small><b>{money(s.pending)}</b></div><div className={"stat" + (s.approved ? " hl" : "")}><small>Ready to pay</small><b>{money(s.approved)}</b></div><div className="stat"><small>Paid</small><b>{money(s.paid)}</b></div></div>
      <div className="g2"><div>
        <form className="card" method="post" action="/api/admin/do"><h2>Terms</h2><input type="hidden" name="action" value="aff_save" /><input type="hidden" name="id" value={a.id} />
          <div className="row3"><label>Commission %<input name="commission" type="number" min="1" max="50" defaultValue={a.commission_pct} /></label><label>Customer discount %<input name="discount" type="number" min="0" max="50" defaultValue={a.discount_pct} /></label>
            <label>Status<select name="status" defaultValue={a.status === "pending" || a.status === "rejected" ? "suspended" : a.status}><option value="active">Active</option><option value="suspended">Suspended</option></select></label></div>
          <label>Payout PayPal email<input name="payout_email" defaultValue={a.payout_email || ""} /></label><label>Internal notes<textarea name="notes" defaultValue={a.notes || ""} /></label><button className="b">Save</button>
          <p className="mut" style={{ margin: "10px 0 0" }}>Changes apply to new orders only. Existing commissions keep the rate they were created with.</p></form>
        <div className="card tw"><h2>Commissions</h2><table><thead><tr><th>Date</th><th>Order</th><th>Via</th><th>Value</th><th>Rate</th><th>Commission</th><th>Status</th></tr></thead><tbody>
          {rows.map((r) => <tr key={r.id}><td>{r.odate.slice(0, 10)}</td><td><a href={"/admin/orders/" + r.order_id}>{orderNo(r.order_id)}</a></td><td>{r.source}</td><td>{money(r.base_pence)}</td><td>{r.rate_pct}%</td><td>{money(r.amount_pence)}</td><td><span className={"chip " + (r.status === "paid" ? "good" : r.status === "cancelled" ? "bad" : "warn")}>{r.status}</span></td></tr>)}
          {!rows.length && <tr><td colSpan="7" className="mut">No commissions yet.</td></tr>}</tbody></table></div></div>
      <div>
        <div className="card"><h2>Details</h2><p><b>Code / link:</b> {a.code}<br /><a href={"/r/" + a.code} target="_blank">/r/{a.code}</a></p><p><b>Email:</b> {a.email}<br /><b>Where they share:</b> {a.website}</p><p style={{ whiteSpace: "pre-wrap" }}><b>Plan:</b> {a.promo}</p>
          <p className="mut">Private dashboard link (send it to the partner):</p><pre>{dash}</pre><CopyBtn text={dash} label="Copy dashboard link" /></div>
        <form className="card" method="post" action="/api/admin/do"><h2>Record a payout</h2><input type="hidden" name="action" value="payout_record" /><input type="hidden" name="id" value={a.id} />
          <p>Ready to pay: <b>{money(s.approved)}</b> to <b>{a.payout_email}</b></p><p className="mut">Send the money in PayPal first, then record it here. This marks all approved commissions as paid.</p>
          <label>Payment reference<input name="reference" placeholder="PayPal transaction ID" /></label><button className="b" disabled={s.approved <= 0}>Mark {money(s.approved)} as paid</button></form>
        <div className="card"><h2>Payout history</h2>{pays.length ? <table><tbody>{pays.map((p) => <tr key={p.id}><td>{p.created_at.slice(0, 10)}</td><td>{money(p.amount_pence)}</td><td className="mut">{p.reference}</td></tr>)}</tbody></table> : <p className="mut">None yet.</p>}</div>
      </div></div>
    </>
  );
}
