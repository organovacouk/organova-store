import { db } from "@/lib/db";
import { authed, challenge, esc } from "@/lib/admin";
export async function GET(req) {
  const a = authed(req); if (a === null) return new Response("Not found", { status: 404 }); if (!a) return challenge();
  const d = db();
  const rv = (await d.prepare("SELECT r.*, p.title pt FROM reviews r LEFT JOIN products p ON p.handle=r.handle WHERE approved=0 ORDER BY r.id DESC LIMIT 50").all()).results;
  const ms = (await d.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 30").all()).results;
  const os = (await d.prepare("SELECT * FROM orders WHERE status<>'created' ORDER BY id DESC LIMIT 50").all()).results;
  const sc = (await d.prepare("SELECT COUNT(*) n FROM subscribers").first()).n;
  const form = (act, id, label) => `<form method="post" action="/admin/action" style="display:inline"><input type="hidden" name="action" value="${act}"><input type="hidden" name="id" value="${id}"><button>${label}</button></form>`;
  const items = (j) => { try { return JSON.parse(j).map((l) => `${l.qty}× ${esc(l.title)}`).join("<br>"); } catch { return ""; } };
  const addr = (j) => { try { return Object.values(JSON.parse(j)).filter(Boolean).map(esc).join(", "); } catch { return ""; } };
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Organova admin</title><style>body{font:15px system-ui;margin:24px;max-width:1100px}table{border-collapse:collapse;width:100%;margin-bottom:32px}td,th{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eee}button{padding:4px 10px;cursor:pointer}</style>
<h1>Organova admin</h1><p>${sc} newsletter subscribers</p>
<h2>Reviews awaiting approval (${rv.length})</h2><table><tr><th>Product</th><th>Rating</th><th>Review</th><th>By</th><th></th></tr>${rv.map((r) => `<tr><td>${esc(r.pt || r.handle)}</td><td>${r.rating}/5</td><td><b>${esc(r.title)}</b><br>${esc(r.body)}</td><td>${esc(r.name)}<br>${esc(r.email)}<br>${r.verified ? "<b>Verified purchase</b>" : "Not matched to an order"}</td><td>${form("approve", r.id, "Approve")} ${form("delete", r.id, "Delete")}</td></tr>`).join("") || "<tr><td colspan=5>None</td></tr>"}</table>
<h2>Orders (latest 50)</h2><table><tr><th>#</th><th>When</th><th>Via</th><th>Status</th><th>Total</th><th>Customer</th><th>Items</th><th>Deliver to</th></tr>${os.map((o) => `<tr><td>${o.id}</td><td>${esc(o.paid_at || o.created_at)}</td><td>${esc(o.provider)}</td><td>${esc(o.status)}</td><td>£${(o.total_pence / 100).toFixed(2)}${o.discount_code ? "<br>" + esc(o.discount_code) : ""}</td><td>${esc(o.name)}<br>${esc(o.email)}</td><td>${items(o.items_json)}</td><td>${addr(o.shipping_json)}</td></tr>`).join("") || "<tr><td colspan=8>No orders yet</td></tr>"}</table>
<h2>Contact messages (latest 30)</h2><table><tr><th>When</th><th>From</th><th>Message</th></tr>${ms.map((m) => `<tr><td>${esc(m.created_at)}</td><td>${esc(m.name)}<br>${esc(m.email)}<br>${esc(m.phone)}</td><td>${esc(m.body)}</td></tr>`).join("") || "<tr><td colspan=3>None</td></tr>"}</table>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
