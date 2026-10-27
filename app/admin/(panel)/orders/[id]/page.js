import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { money } from "@/lib/admin";
import { addr, orderNo, itemsOf } from "@/lib/addr";
import { trackLink, deliveryWindow } from "@/lib/track";
import CopyBtn from "@/components/CopyBtn";
import Confirm from "@/components/admin/Confirm";
export default async function Order({ params, searchParams }) {
  const { id } = await params; const { msg, err } = await searchParams;
  const o = await db().prepare("SELECT * FROM orders WHERE id=?").bind(parseInt(id) || 0).first();
  if (!o) notFound();
  const sup = Object.fromEntries((await db().prepare("SELECT handle,supplier_url FROM products WHERE supplier_url IS NOT NULL AND supplier_url<>''").all()).results.map((r) => [r.handle, r.supplier_url]));
  const cm = await db().prepare("SELECT c.*, f.name, f.code FROM commissions c JOIN affiliates f ON f.id=c.affiliate_id WHERE c.order_id=?").bind(o.id).first();
  const w = await deliveryWindow(); const host = (await headers()).get("host"); const link = o.email && o.status === "paid" ? await trackLink(o, "https://" + host) : null;
  const a = addr(o.shipping_json); const ageDays = Math.floor((Date.now() - new Date((o.paid_at || o.created_at).replace(" ", "T") + "Z").getTime()) / 864e5);
  const late = o.status === "paid" && ["new", "ordered"].includes(o.fulfilment) && ageDays > w.late;
  const block = [o.name, a.line1, a.line2, a.city, a.county, a.postcode, a.country, a.phone && "Phone: " + a.phone].filter(Boolean).join("\n");
  const left = o.total_pence - (o.refunded_pence || 0);
  return (
    <>
      <div className="top"><div><a href="/admin/orders" className="mut">← Orders</a><h1>Order {orderNo(o.id)}</h1></div><span className={"chip " + (o.status === "paid" ? "good" : "bad")}>{o.status}</span></div>
      {msg && <p className="ok">{msg}</p>}{err && <p className="err">{err}</p>}
      {late && <p className="err">This order has had no tracking for {ageDays} days. Check it with your supplier.</p>}
      <div className="g2">
        <div>
          <div className="card"><h2>Items</h2><table><tbody>{itemsOf(o.items_json).map((l, i) => <tr key={i}><td>{l.qty} × {l.title}{l.handle ? (sup[l.handle] ? <> · <a href={sup[l.handle]} target="_blank" rel="noopener">supplier page ↗</a></> : <> · <a href="/admin/products" className="mut">add supplier link</a></>) : null}</td><td style={{ textAlign: "right" }}>{money(l.price_pence * l.qty)}</td></tr>)}
            <tr><td className="mut">Subtotal</td><td style={{ textAlign: "right" }}>{money(o.subtotal_pence)}</td></tr>
            {o.discount_pence > 0 && <tr><td className="mut">Discount ({o.discount_code})</td><td style={{ textAlign: "right" }}>−{money(o.discount_pence)}</td></tr>}
            <tr><td className="mut">Delivery</td><td style={{ textAlign: "right" }}>{o.shipping_pence ? money(o.shipping_pence) : "Free"}</td></tr>
            <tr><td><b>Total paid</b></td><td style={{ textAlign: "right" }}><b>{money(o.total_pence)}</b></td></tr>
            {o.refunded_pence > 0 && <tr><td className="mut">Refunded</td><td style={{ textAlign: "right" }}>−{money(o.refunded_pence)}</td></tr>}</tbody></table></div>
          <div className="g2b">
            <div className="card"><h2>Customer</h2><p>{o.name}<br /><a href={"mailto:" + o.email}>{o.email}</a></p><p className="mut">Paid via {o.provider} · {o.paid_at || o.created_at}<br />Ref: {o.paypal_order_id}</p></div>
            <div className="card"><h2>Deliver to</h2><small className="mut">Click the box, then copy into AliExpress</small><pre>{block}</pre></div>
          </div>
          {link && <div className="card"><h2>Customer order page</h2><p className="mut">This private link shows your customer their live status. It is included in the shipping email.</p><pre>{link}</pre><CopyBtn text={link} label="Copy link" />
            {o.tracking_number && <form method="post" action="/api/admin/fulfil" style={{ display: "inline", marginLeft: 8 }}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="action" value="resend" /><button className="b o sm">Resend tracking email</button></form>}</div>}
        </div>
        <div>
          <form className="card" method="post" action="/api/admin/fulfil"><h2>Fulfilment</h2><input type="hidden" name="id" value={o.id} />
            <label>Status<select name="fulfilment" defaultValue={o.fulfilment}><option value="new">New (not ordered yet)</option><option value="ordered">Ordered from supplier</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></label>
            <label>Supplier order number<input name="supplier_ref" defaultValue={o.supplier_ref || ""} /></label>
            <label>Tracking number <span className="h">adding one marks the order shipped</span><input name="tracking_number" defaultValue={o.tracking_number || ""} /></label>
            <label>Tracking link <span className="h">blank = Cainiao link</span><input name="tracking_url" defaultValue={o.tracking_url || ""} /></label>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}><input type="checkbox" name="notify" value="1" defaultChecked={o.provider !== "shopify"} style={{ width: "auto" }} /> Email the customer (shipping or delivered email)</label>
            {o.provider === "shopify" && <p className="mut">Imported from Shopify, so email is off by default to avoid a duplicate if Shopify already emailed them.</p>}
            <button className="b">Save</button></form>
          <form className="card" method="post" action="/api/admin/do"><h2>Internal note</h2><input type="hidden" name="action" value="note" /><input type="hidden" name="id" value={o.id} />
            <textarea name="note" defaultValue={o.note || ""} placeholder="Only you can see this" /><p><button className="b o sm">Save note</button></p></form>
          {cm && <div className="card"><h2>Affiliate</h2><p><a href={"/admin/affiliates/" + cm.affiliate_id}>{cm.name}</a> ({cm.code}) via {cm.source}<br />Commission {money(cm.amount_pence)} · {cm.status}</p><p className="mut">A full refund or a cancelled order also cancels the commission.</p></div>}
          {o.status === "paid" && ["stripe", "paypal"].includes(o.provider) && left > 0 ? (
            <form className="card" method="post" action="/api/admin/refund"><h2>Refund</h2><input type="hidden" name="id" value={o.id} />
              <p className="mut">Sends the money back through {o.provider === "stripe" ? "Stripe" : "PayPal"}. Up to {money(left)} can be refunded.</p>
              <label>Amount (£) <span className="h">blank = full {money(left)}</span><input name="amount" inputMode="decimal" /></label><label>Reason<input name="reason" placeholder="e.g. item not received" /></label>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}><input type="checkbox" name="notify" value="1" defaultChecked style={{ width: "auto" }} /> Email the customer a refund notice</label>
              <Confirm msg="Send this refund? It cannot be undone." className="b r">Refund</Confirm></form>
          ) : <div className="card"><h2>Refunds</h2><p className="mut">{o.provider === "shopify" ? "This order was paid through Shopify. Refund it there." : o.refunded_pence >= o.total_pence ? "Fully refunded." : "Not available for this order."}</p></div>}
        </div>
      </div>
    </>
  );
}
