import { db } from "@/lib/db";
import { authed, challenge, esc, STYLE } from "@/lib/admin";
export async function GET(req) {
  const a = authed(req); if (a === null) return new Response("Not found", { status: 404 }); if (!a) return challenge();
  const q = (new URL(req.url).searchParams.get("q") || "").trim();
  const rows = (await db().prepare("SELECT id,handle,title,available,supplier_url FROM products WHERE status='active' AND (?1='' OR title LIKE '%'||?1||'%') ORDER BY available ASC, id").bind(q).all()).results;
  const html = `<!doctype html>${STYLE}<title>Products — Organova admin</title><h1>Products &amp; stock</h1><nav><a href="/admin">Orders</a><a href="/admin/products">Products &amp; stock</a></nav>
<form method="get"><input name="q" value="${esc(q)}" placeholder="Search products" style="max-width:320px"> <button class="g">Search</button></form>
<p class="muted">Set a product to Sold out and it disappears from buying (shows a Sold out label). Paste the AliExpress/supplier link so it appears on each order.</p>
${rows.map((p) => `<form class="card" method="post" action="/admin/action" style="display:grid;grid-template-columns:2fr 140px 3fr 90px;gap:12px;align-items:center;padding:10px 14px;margin:8px 0"><input type="hidden" name="action" value="product"><input type="hidden" name="id" value="${p.id}"><a href="/products/${esc(p.handle)}" target="_blank">${esc(p.title)}</a><select name="available" style="margin:0"><option value="1"${p.available ? " selected" : ""}>Available</option><option value="0"${p.available ? "" : " selected"}>Sold out</option></select><input name="supplier_url" value="${esc(p.supplier_url)}" placeholder="Supplier link (https://…)" style="margin:0"><button>Save</button></form>`).join("")}`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
