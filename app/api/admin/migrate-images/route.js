import { db, env } from "@/lib/db";
// One-off: copies images from the live Shopify store into Cloudflare KV, and reads stock status. Safe to re-run. Delete after migration.
const SHOP = "https://organova.co.uk";
const H = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36", Accept: "application/json,image/avif,image/webp,image/*,*/*;q=0.8", "Accept-Language": "en-GB,en;q=0.9" };
const ASSETS = { "hero-kitchen": "Organised_modern_kitchen_with_smart_storage_solutions.jpg", "hero-bedroom": "hero-bedroom.png", "hero-bathroom": "modern-white-bathroom.jpg", "before-kitchen": "before-cluttered-kitchen.png", "after-kitchen": "after-organised-kitchen.png" };
async function save(key, url) {
  const r = await fetch(url, { headers: H }); if (!r.ok) throw new Error("HTTP " + r.status + " for image");
  const type = r.headers.get("content-type") || "";
  if (!type.startsWith("image/")) throw new Error("not an image: " + type);
  await env().IMAGES.put(key, await r.arrayBuffer(), { metadata: { type } });
}
async function getJson(url) {
  const r = await fetch(url, { headers: H }); const t = await r.text();
  try { return JSON.parse(t); } catch { throw new Error(`HTTP ${r.status}, not JSON. Shopify sent: ${t.slice(0, 140).replace(/\s+/g, " ")}`); }
}
const sized = (u, w) => (u.startsWith("//") ? "https:" + u : u).replace(/\?.*$/, "") + "?width=" + w;
export async function GET(req) {
  const after = parseInt(new URL(req.url).searchParams.get("after") || "0");
  const log = [];
  if (after === 0) for (const [k, f] of Object.entries(ASSETS)) { try { await save(k, `${SHOP}/cdn/shop/files/${f}?width=1600`); log.push("ok " + k); } catch (e) { log.push(`FAILED ${k}: ${e.message}`); } }
  const rows = (await db().prepare("SELECT id,handle FROM products WHERE id>? AND gallery_done=0 ORDER BY id LIMIT 6").bind(after).all()).results;
  let okCount = 0;
  for (const r of rows) {
    try {
      const pj = await getJson(`${SHOP}/products/${r.handle}.js`);
      const imgs = (pj.images || []).slice(0, 5); const urls = [];
      for (let i = 0; i < imgs.length; i++) { const key = `p${r.id}-${i}`; await save(key, sized(imgs[i], 1000)); urls.push("/img/" + key); }
      if (!urls.length) throw new Error("no images");
      await db().prepare("UPDATE products SET image_url=?, images_json=?, available=?, gallery_done=1 WHERE id=?").bind(urls[0], JSON.stringify(urls), pj.available ? 1 : 0, r.id).run();
      log.push(`ok ${r.id} (${urls.length} images${pj.available ? "" : ", sold out"})`); okCount++;
    } catch (e) { log.push(`FAILED ${r.id}: ${e.message}`); }
  }
  const last = rows.length ? rows[rows.length - 1].id : after;
  const allFailed = rows.length > 0 && okCount === 0;
  const done = rows.length < 6 || allFailed;
  const left = (await db().prepare("SELECT COUNT(*) n FROM products WHERE gallery_done=0").first()).n;
  const msg = allFailed ? "Stopped: every product in this batch failed. Please send the lines above to your assistant." : done ? (left ? left + " product(s) not finished. Open /api/admin/migrate-images (without ?after=) to retry them." : "All done. You can close this page.") : "This page refreshes by itself. Leave it open.";
  const html = `<meta charset="utf-8">${done ? "" : `<meta http-equiv="refresh" content="1;url=?after=${last}">`}<body style="font-family:system-ui;padding:24px"><h1>${done ? "Finished" : "Moving images… " + left + " products left"}</h1><pre style="white-space:pre-wrap">${log.join("\n")}</pre><p>${msg}</p></body>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
