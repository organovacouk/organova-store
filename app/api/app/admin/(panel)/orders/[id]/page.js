import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { money } from "@/lib/admin";
import { addr, orderNo, itemsOf } from "@/lib/addr";
export default async function Order({ params }) {
  const { id } = await params;
  const o = await db().prepare("SELECT * FROM orders WHERE id=?").bind(parseInt(id) || 0).first();
  if (!o) notFound();
  const sup = Object.fromEntries((await db().prepare("SELECT handle,supplier_url FROM products WHERE supplier_url IS NOT NULL AND supplier_url<>''").all()).results.map((r) => [r.handle, r.supplier_url]));
  const a = addr(o.shipping_json);
  const block = [o.name, a.line1, a.line2, a.city, a.county, a.postcode, a.country, a.phone && "Phone: " + a.phone].filter(Boolean).join("\n");
  return (
    <>
      <div className="top"><div><a href="/admin/orders" className="mut">← Orders</a><h1>Order {orderNo(o.id)}</h1></div><span className={"chip " + (o.status === "paid" ? "good" : "bad")}>{o.status}</span></div>
      <div className="g2">
        <div>
          <div className="card"><h2>Items</h2><table><tbody>{itemsOf(o.items_json).map((l, i) => <tr key={i}><td>{l.qty} × {l.title}{l.handle ? (sup[l.handle] ? <> · <a href={sup[l.handle]} target="_blank" rel="noopener">supplier page ↗</a></> : <> · <a href="/admin/products" className="mut">add supplier link</a></>) : null}</td><td style={{ textAlign: "right" }}>{money(l.price_pence * l.qty)}</td></tr>)}
            <tr><td className="mut">Subtotal</td><td style={{ textAlign: "right" }}>{money(o.subtotal_pence)}</td></tr>
            {o.discount_pence > 0 && <tr><td className="mut">Discount ({o.discount_code})</td><td style={{ textAlign: "right" }}>−{money(o.discount_pence)}</td></tr>}
            <tr><td className="mut">Delivery</td><td style={{ textAlign: "right" }}>{o.shipping_pence ? money(o.shipping_pence) : "Free"}</td></tr>
            <tr><td><b>Total paid</b></td><td style={{ textAlign: "right" }}><b>{money(o.total_pence)}</b></td></tr></tbody></table></div>
          <div className="g2b">
            <div className="card"><h2>Customer</h2><p>{o.name}<br /><a href={"mailto:" + o.email}>{o.email}</a></p><p className="mut">Paid via {o.provider} · {(o.paid_at || o.created_at)}<br />Ref: {o.paypal_order_id}</p></div>
            <div className="card"><h2>Deliver to</h2><small className="mut">Click the box, then copy into AliExpress / your supplier</small><pre>{block}</pre></div>
          </div>
        </div>
        <div>
          <form className="card" method="post" action="/api/admin/do"><h2>Fulfilment</h2><input type="hidden" name="action" value="fulfil" /><input type="hidden" name="id" value={o.id} />
            <label>Status<select name="fulfilment" defaultValue={o.fulfilment}><option value="new">New (not ordered yet)</option><option value="ordered">Ordered from supplier</option><option value="shipped">Shipped (emails customer)</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled / refunded</option></select></label>
            <label>Supplier order number<input name="supplier_ref" defaultValue={o.supplier_ref || ""} /></label>
            <label>Tracking number<input name="tracking_number" defaultValue={o.tracking_number || ""} /></label>
            <label>Tracking link <span className="h">(blank = Cainiao link for AliExpress parcels)</span><input name="tracking_url" defaultValue={o.tracking_url || ""} /></label>
            <button className="b">Save</button></form>
          <form className="card" method="post" action="/api/admin/do"><h2>Internal note</h2><input type="hidden" name="action" value="note" /><input type="hidden" name="id" value={o.id} />
            <textarea name="note" defaultValue={o.note || ""} placeholder="Only you can see this" /><p><button className="b o sm">Save note</button></p></form>
          <div className="card"><h2>Refunds</h2><p className="mut">Issue the refund in your PayPal or Stripe dashboard, then set the status above to Cancelled / refunded.</p></div>
        </div>
      </div>
    </>
  );
}
