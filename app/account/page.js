import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { readSession, COOKIE } from "@/lib/account";
import { addr, orderNo, itemsOf, FUL } from "@/lib/addr";
import AccountLogin from "@/components/AccountLogin";
import ProfileForm from "@/components/ProfileForm";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your account", robots: { index: false } };
const money = (p) => "£" + (p / 100).toFixed(2);
export default async function Account({ searchParams }) {
  const { expired } = await searchParams;
  const email = await readSession((await cookies()).get(COOKIE)?.value);
  if (!email) return (<section className="doc"><h1>Sign in or create an account</h1><p>See your orders and tracking, and check out faster. Enter your email and we will send you a sign-in link.</p>{expired && <p role="alert"><strong>That link has expired.</strong> Please request a new one.</p>}<AccountLogin /></section>);
  const mem = await db().prepare("SELECT name, marketing FROM members WHERE email=?").bind(email).first();
  const orders = (await db().prepare("SELECT * FROM orders WHERE status='paid' AND LOWER(email)=? ORDER BY id DESC").bind(email).all()).results;
  return (
    <section className="doc"><h1>{mem?.name ? `Hello, ${mem.name.split(" ")[0]}` : "Your account"}</h1><p>Signed in as <b>{email}</b></p>
      <form method="post" action="/account/logout"><button className="btn ghost sm">Sign out</button></form>
      <h2>Your details</h2><ProfileForm name={mem?.name} marketing={mem?.marketing} />
      <h2>Your orders</h2>
      {!orders.length && <p>No orders yet. Orders placed with this email, including as a guest, will appear here. <a href="/shop">Start shopping</a></p>}
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
