import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { readSession, COOKIE } from "@/lib/account";
import { addr, orderNo, itemsOf, FUL } from "@/lib/addr";
import AccountLogin from "@/components/AccountLogin";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your account", robots: { index: false } };
const money = (p) => "£" + (p / 100).toFixed(2);
export default async function Account({ searchParams }) {
  const { expired } = await searchParams;
  const email = await readSession((await cookies()).get(COOKIE)?.value);
  if (!email) return (<section className="doc"><h1>Your account</h1><p>See your orders and tracking. Enter the email you used at checkout.</p>{expired && <p role="alert"><strong>That link has expired.</strong> Please request a new one.</p>}<AccountLogin /></section>);
  const orders = (await db().prepare("SELECT * FROM orders WHERE status='paid' AND LOWER(email)=? ORDER BY id DESC").bind(email).all()).results;
  return (
    <section className="doc"><h1>Your orders</h1><p>Signed in as <b>{email}</b></p>
      <form method="post" action="/account/logout"><button className="btn ghost sm">Sign out</button></form>
      {!orders.length && <p>No orders found for this email yet.</p>}
      {orders.map((o) => { const a = addr(o.shipping_json); return (
        <article key={o.id} className="ord">
          <h2>Order {orderNo(o.id)} <span className={"st " + o.fulfilment}>{FUL[o.fulfilment] || "Processing"}</span></h2>
          <p className="muted">{(o.paid_at || o.created_at).slice(0, 10)} · {money(o.total_pence)}{o.discount_code ? ` (code ${o.discount_code})` : ""}</p>
          <ul>{itemsOf(o.items_json).map((l, i) => <li key={i}>{l.qty} × {l.title}</li>)}</ul>
          <p>Delivering to {[a.city, a.postcode].filter(Boolean).join(", ")}</p>
          {o.tracking_number && <p>Tracking: <b>{o.tracking_number}</b> {o.tracking_url && <a href={o.tracking_url}>Track parcel</a>}</p>}
        </article>); })}
      <p className="note">Need help with an order? <a href="/pages/contact">Contact us</a> and quote your order number.</p>
    </section>
  );
}
