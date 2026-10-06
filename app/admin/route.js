import { db } from "@/lib/db";
import { authed, challenge, esc, STYLE } from "@/lib/admin";
import { addr, orderNo, itemsOf, FUL } from "@/lib/addr";
export async function GET(req) {
  const a = authed(req); if (a === null) return new Response("Not found", { status: 404 }); if (!a) return challenge();
  const d = db();
  const rv = (await d.prepare("SELECT r.*, p.title pt FROM reviews r LEFT JOIN products p ON p.handle=r.handle WHERE approved=0 ORDER BY r.id DESC LIMIT 50").all()).results;
  const ms = (await d.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 30").all()).results;
  const os = (await d.prepare("SELECT * FROM orders WHERE status='paid' ORDER BY (fulfilment IN ('new','ordered')) DESC, id DESC LIMIT 60").all()).results;
  const other = (await d.prepare("SELECT id,status,provider,total_pence,created_at FROM orders WHERE status NOT IN ('paid','created') ORDER BY id DESC LIMIT 10").all()).results;
  const sup = Object.fromEntries((await d.prepare("SELECT handle,supplier_url FROM products WHERE supplier_url IS NOT NULL AND supplier_url<>''").all()).results.map((r) => [r.handle, r.supplier_url]));
  const sc = (await d.prepare("SELECT COUNT(*) n FROM subscribers").first()).n;
  const form = (act, id, label) => `<form method="post" action="/admin/action" style="display:inline"><input type="hidden" name="action" value="${act}"><input type="hidden" name="id" value="${id}"><button>${label}</button></form>`;
  const card = (o) => {
    const ad = addr(o.shipping_json); const todo = ["new", "ordered"].includes(o.fulfilment);
    const block = [o.name, ad.line1, ad.line2, ad.city, ad.county, ad.postcode, ad.country, ad.phone && "Phone: " + ad.phone].filter(Boolean).map(esc).join("\n");
    const its = itemsOf(o.items_json).map((l) => `${l.qty} × ${esc(l.title)} — £${(l.price_pence / 100).toFixed(2)}${l.handle ? (sup[l.handle] ? ` · <a href="${esc(sup[l.handle])}" target="_blank" rel="noopener">supplier page</a>` : ` · <span class="muted">no supplier link yet (add under Products)</span>`) : ""}`).join("<br>");
    return `<div class="card ${todo ? "todo" : ""}" id="o${o.id}"><h3 style="margin:0">${orderNo(o.id)} <span class="tag">${FUL[o.fulfilment] || o.fulfilment}${o.fulfilment === "ordered" ? " (ordered from supplier)" : ""}</span></h3>
      <p class="muted">${esc(o.paid_at || o.created_at)} · ${esc(o.provider)} · £${(o.total_pence / 100).toFixed(2)}${o.discount_code ? " · code " + esc(o.discount_code) : ""} · ${esc(o.email)}</p>
      <div class="row"><div><b>Items</b><br>${its}<br><b>Deliver to</b> (click to select, then copy)<pre>${block}</pre></div>
      <div><form method="post" action="/admin/action"><input type="hidden" name="action" value="fulfil"><input type="hidden" name="id" value="${o.id}">
      <label>Status<select name="fulfilment">${Object.entries({ new: "New (not ordered yet)", ordered: "Ordered from supplier", shipped: "Shipped (emails customer)", delivered: "Delivered", cancelled: "Cancelled" }).map(([k, v]) => `<option value="${k}"${o.fulfilment === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
      <label>Supplier order number<input name="supplier_ref" value="${esc(o.supplier_ref)}"></label>
      <label>Tracking number<input name="tracking_number" value="${esc(o.tracking_number)}"></label>
      <label>Tracking link (optional; AliExpress parcels default to Cainiao)<input name="tracking_url" value="${esc(o.tracking_url)}"></label>
      <button>Save</button></form></div></div></div>`;
  };
  const html = `<!doctype html>${STYLE}<title>Organova admin</title><h1>Organova admin</h1><nav><a href="/admin">Orders</a><a href="/admin/products">Products &amp; stock</a></nav><p class="muted">${sc} newsletter subscribers</p>
<h2>Orders (${os.filter((o) => ["new", "ordered"].includes(o.fulfilment)).length} to do)</h2>${os.map(card).join("") || "<p>No orders yet.</p>"}
${other.length ? `<h3>Other payment attempts</h3><table><tr><th>#</th><th>Status</th><th>Via</th><th>Total</th><th>When</th></tr>${other.map((o) => `<tr><td>${orderNo(o.id)}</td><td>${esc(o.status)}</td><td>${esc(o.provider)}</td><td>£${(o.total_pence / 100).toFixed(2)}</td><td>${esc(o.created_at)}</td></tr>`).join("")}</table>` : ""}
<h2>Reviews awaiting approval (${rv.length})</h2><table><tr><th>Product</th><th>Rating</th><th>Review</th><th>By</th><th></th></tr>${rv.map((r) => `<tr><td>${esc(r.pt || r.handle)}</td><td>${r.rating}/5</td><td><b>${esc(r.title)}</b><br>${esc(r.body)}</td><td>${esc(r.name)}<br>${esc(r.email)}<br>${r.verified ? "<b>Verified purchase</b>" : "Not matched to an order"}</td><td>${form("approve", r.id, "Approve")} ${form("delete", r.id, "Delete")}</td></tr>`).join("") || "<tr><td colspan=5>None</td></tr>"}</table>
<h2>Contact messages (latest 30)</h2><table><tr><th>When</th><th>From</th><th>Message</th></tr>${ms.map((m) => `<tr><td>${esc(m.created_at)}</td><td>${esc(m.name)}<br>${esc(m.email)}<br>${esc(m.phone)}</td><td>${esc(m.body)}</td></tr>`).join("") || "<tr><td colspan=3>None</td></tr>"}</table>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
