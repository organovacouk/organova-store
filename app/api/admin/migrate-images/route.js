import { db, env } from "@/lib/db";
// One-off: copies product images from Shopify's CDN into Cloudflare KV. Safe to re-run. Delete this file after migration.
export async function GET(req) {
  const after = parseInt(new URL(req.url).searchParams.get("after") || "0");
  const rows = (await db().prepare("SELECT id,image_url FROM products WHERE id>? AND image_url LIKE 'https://cdn.shopify.com/%' ORDER BY id LIMIT 10").bind(after).all()).results;
  const log = [];
  for (const r of rows) {
    try {
      const res = await fetch(r.image_url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const type = res.headers.get("content-type") || "image/jpeg";
      const ext = type.includes("webp") ? "webp" : type.includes("png") ? "png" : "jpg";
      const key = `p${r.id}.${ext}`;
      await env().IMAGES.put(key, await res.arrayBuffer(), { metadata: { type } });
      await db().prepare("UPDATE products SET image_url=? WHERE id=?").bind("/img/" + key, r.id).run();
      log.push(`ok ${r.id}`);
    } catch (e) { log.push(`FAILED ${r.id}: ${e.message}`); }
  }
  const last = rows.length ? rows[rows.length - 1].id : after;
  const done = rows.length < 10;
  const failed = (await db().prepare("SELECT COUNT(*) n FROM products WHERE image_url LIKE 'https://cdn.shopify.com/%'").first()).n;
  const html = `<meta charset="utf-8">${done ? "" : `<meta http-equiv="refresh" content="1;url=?after=${last}">`}<body style="font-family:system-ui;padding:24px"><h1>${done ? "Finished" : "Moving images… (up to product " + last + " of 122)"}</h1><pre>${log.join("\n")}</pre><p>${done ? failed + " image(s) still on Shopify. " + (failed ? "Re-open this page to retry them." : "All moved. You can close this page.") : "This page refreshes by itself. Leave it open."}</p></body>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
