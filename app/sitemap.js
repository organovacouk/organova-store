export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { SITE } from "@/lib/q";
export default async function sitemap() {
  const d = db();
  const p = (await d.prepare("SELECT handle FROM products WHERE status='active'").all()).results;
  const t = (await d.prepare("SELECT DISTINCT product_type t FROM products WHERE status='active'").all()).results;
  const b = (await d.prepare("SELECT slug,published_at FROM posts WHERE published=1").all()).results;
  const fixed = ["", "/shop", "/blog", "/pages/about-us", "/pages/faq", "/pages/contact", "/policies/shipping-policy", "/policies/refund-policy", "/policies/privacy-policy", "/policies/terms-of-service", "/policies/legal-notice"];
  return [...fixed.map((u) => ({ url: SITE + u })), ...t.map((x) => ({ url: SITE + "/shop?type=" + encodeURIComponent(x.t) })), ...p.map((x) => ({ url: SITE + "/products/" + x.handle })), ...b.map((x) => ({ url: SITE + "/blog/" + x.slug, lastModified: x.published_at }))];
}
