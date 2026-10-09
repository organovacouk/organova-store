import { db } from "@/lib/db";
import { SITE } from "@/lib/q";
export const dynamic = "force-dynamic";
const x = (s) => String(s ?? "").replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
const abs = (u) => (u && u.startsWith("/") ? SITE + u : u);
export async function GET() {
  const rows = (await db().prepare("SELECT p.* FROM products p WHERE p.status='active' AND NOT EXISTS (SELECT 1 FROM variants v WHERE v.handle=p.handle) ORDER BY p.id").all()).results;
  const items = rows.map((p) => {
    const sale = p.compare_at_pence > p.price_pence;
    const desc = p.description_html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().slice(0, 4900) || p.title;
    return `<item><g:id>${x(p.handle.slice(0, 50))}</g:id><title>${x(p.title.slice(0, 150))}</title><description>${x(desc)}</description><link>${SITE}/products/${x(p.handle)}</link><g:image_link>${x(abs(p.image_url))}</g:image_link><g:availability>${p.available ? "in_stock" : "out_of_stock"}</g:availability><g:price>${((sale ? p.compare_at_pence : p.price_pence) / 100).toFixed(2)} GBP</g:price>${sale ? `<g:sale_price>${(p.price_pence / 100).toFixed(2)} GBP</g:sale_price>` : ""}<g:condition>new</g:condition><g:brand>Organova</g:brand><g:identifier_exists>no</g:identifier_exists><g:product_type>${x(p.product_type)}</g:product_type><g:shipping><g:country>GB</g:country><g:service>Standard</g:service><g:price>0.00 GBP</g:price></g:shipping></item>`;
  }).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Organova</title><link>${SITE}</link><description>Organova product feed</description>${items}</channel></rss>`, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=900" } });
}
