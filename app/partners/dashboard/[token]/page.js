import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { affStats } from "@/lib/aff";
import { orderNo } from "@/lib/addr";
import CopyBtn from "@/components/CopyBtn";
export const dynamic = "force-dynamic";
export const metadata = { title: "Partner dashboard", robots: { index: false } };
const money = (p) => "£" + ((p || 0) / 100).toFixed(2);
const PAGES = [["Home page", "/"], ["Shop all", "/shop"], ["Kitchen", "/shop?type=Kitchen"], ["Bathroom", "/shop?type=Bathroom"], ["Bedroom & Wardrobe", "/shop?type=Bedroom%20%26%20Wardrobe"], ["Hallway & Shoes", "/shop?type=Hallway%20%26%20Shoes"], ["Living Room & General", "/shop?type=Living%20Room%20%26%20General"], ["Sale", "/shop?sale=1"]];
export default async function Dash({ params }) {
  const { token } = await params;
  const a = /^[a-f0-9]{48}$/.test(token) ? await db().prepare("SELECT * FROM affiliates WHERE token=?").bind(token).first() : null;
  if (!a) notFound();
  const host = (await headers()).get("host"); const base = "https://" + host;
  if (a.status !== "active") return <section className="doc"><h1>Hello {a.name.split(" ")[0]}</h1><p>{a.status === "pending" ? "Your application is being reviewed. We will email you as soon as it is approved." : "Your partner account is not active. Please contact us if you have questions."}</p></section>;
  const s = await affStats(a.id);
  const rows = (await db().prepare("SELECT c.*, o.created_at odate FROM commissions c JOIN orders o ON o.id=c.order_id WHERE c.affiliate_id=? ORDER BY c.id DESC LIMIT 100").bind(a.id).all()).results;
  const pays = (await db().prepare("SELECT * FROM aff_payouts WHERE affiliate_id=? ORDER BY id DESC LIMIT 20").bind(a.id).all()).results;
  const link = `${base}/r/${a.code}`;
  return (
    <section style={{ padding: "28px 0 56px" }}>
      <p className="eyebrow">Partner dashboard</p><h1 style={{ fontSize: 36 }}>Hello {a.name.split(" ")[0]}</h1>
      <div className="kpis"><div><small>Clicks (30 days)</small><b>{s.clicks30}</b></div><div><small>Orders</small><b>{s.orders}</b></div><div><small>Sales referred</small><b>{money(s.sales)}</b></div>
        <div><small>Pending (14-day window)</small><b>{money(s.pending)}</b></div><div><small>Ready to pay</small><b>{money(s.approved)}</b></div><div><small>Paid to date</small><b>{money(s.paid)}</b></div></div>
      <h2>Your link and code</h2>
      <div className="linkbox"><span>Link</span><code>{link}</code><CopyBtn text={link} /></div>
      <div className="linkbox"><span>Code</span><code>{a.code}</code><CopyBtn text={a.code} /><small>{a.discount_pct}% off for your audience</small></div>
      <p className="note">Commission: {a.commission_pct}% of the order value after discounts. Always label posts as <b>ad</b> or <b>affiliate link</b>. Read the <a href="/partners/terms">partner terms</a>.</p>
      <h2 style={{ marginTop: 28 }}>Links to specific pages</h2>
      {PAGES.map(([l, p]) => { const u = `${base}/r/${a.code}?to=${encodeURIComponent(p)}`; return <div className="linkbox" key={l}><span style={{ minWidth: 150 }}>{l}</span><code>{u}</code><CopyBtn text={u} /></div>; })}
      <h2 style={{ marginTop: 28 }}>Your orders</h2>
      <div style={{ overflowX: "auto" }}><table className="tbl"><thead><tr><th>Date</th><th>Order value</th><th>Via</th><th>Commission</th><th>Status</th></tr></thead><tbody>
        {rows.map((r) => <tr key={r.id}><td>{r.odate.slice(0, 10)}</td><td>{money(r.base_pence)}</td><td>{r.source === "code" ? "Code" : "Link"}</td><td>{money(r.amount_pence)}</td><td>{r.status === "pending" ? "Pending" : r.status === "approved" ? "Ready to pay" : r.status === "paid" ? "Paid" : "Cancelled"}</td></tr>)}
        {!rows.length && <tr><td colSpan="5">No orders yet. Share your link to get started.</td></tr>}</tbody></table></div>
      {pays.length > 0 && <><h2 style={{ marginTop: 28 }}>Payouts</h2><table className="tbl"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody>{pays.map((p) => <tr key={p.id}><td>{p.created_at.slice(0, 10)}</td><td>{money(p.amount_pence)}</td><td>{p.method}</td><td>{p.reference}</td></tr>)}</tbody></table></>}
      <p className="note" style={{ marginTop: 24 }}>This page is private to you. Please don't share the address. Payouts go to {a.payout_email ? a.payout_email.replace(/(.).+(@.+)/, "$1•••$2") : "your PayPal email"}. Questions? <a href="/pages/contact">Contact us</a>.</p>
    </section>
  );
}
