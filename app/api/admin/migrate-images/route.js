import { db, env } from "@/lib/db";
// One-off: copies images from the live Shopify store into Cloudflare KV, and reads stock status. Safe to re-run. Delete after migration.
const SHOP = "https://organova.co.uk";
const ASSETS = { "hero-kitchen": "Organised_modern_kitchen_with_smart_storage_solutions.jpg", "hero-bedroom": "hero-bedroom.png", "hero-bathroom": "modern-white-bathroom.jpg", "before-kitchen": "before-cluttered-kitchen.png", "after-kitchen": "after-organised-kitchen.png" };
async function save(key, url) {
  const r = await fetch(url); if (!r.ok) throw new Error("HTTP " + r.status);
  await env().IMAGES.put(key, await r.arrayBuffer(), { metadata: { type: r.headers.get("content-type") || "image/jpeg" } });
}
const sized = (u, w) => (u.startsWith("//") ? "https:" + u : u).replace(/\?.*$/, "") + "?width=" + w;
export async function GET(req) {
  const after = parseInt(new URL(req.url).searchParams.get("after") || "0");
  const log = [];
  if (after === 0) for (const [k, f] of Object.entries(ASSETS)) { try { await save(k, `${SHOP}/cdn/shop/files/${f}?width=1600`); log.push("ok " + k); } catch (e) { log.push(`FAILED ${k}: ${e.message}`); } }
  const rows = (await db().prepare("SELECT id,handle,image_url FROM products WHERE id>? AND gallery_done=0 ORDER BY id LIMIT 6").bind(after).all()).results;
  for (const r of rows) {
    try {
      const pj = await (await fetch(`${SHOP}/products/${r.handle}.js`)).json();
      const imgs = (pj.images || []).slice(0, 5); const urls = [];
      for (let i = 0; i < imgs.length; i++) { const key = `p${r.id}-${i}`; await save(key, sized(imgs[i], 1000)); urls.push("/img/" + key); }
      if (!urls.length) throw new Error("no images");
      await db().prepare("UPDATE products SET image_url=?, images_json=?, available=?, gallery_done=1 WHERE id=?").bind(urls[0], JSON.stringify(urls), pj.available ? 1 : 0, r.id).run();
      log.push(`ok ${r.id} (${urls.length} images${pj.available ? "" : ", sold out"})`);
    } catch (e) { log.push(`FAILED ${r.id}: ${e.message}`); }
  }
  const last = rows.length ? rows[rows.length - 1].id : after;
  const done = rows.length < 6;
  const left = (await db().prepare("SELECT COUNT(*) n FROM products WHERE gallery_done=0").first()).n;
  const html = `<meta charset="utf-8">${done ? "" : `<meta http-equiv="refresh" content="1;url=?after=${last}">`}<body style="font-family:system-ui;padding:24px"><h1>${done ? "Finished" : "Moving images… " + left + " products left"}</h1><pre>${log.join("\n")}</pre><p>${done ? (left ? left + " product(s) not finished. Re-open /api/admin/migrate-images to retry them." : "All done. You can close this page.") : "This page refreshes by itself. Leave it open."}</p></body>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
