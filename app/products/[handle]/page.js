import { notFound } from "next/navigation";
import { db, gbp } from "@/lib/db";
import { SEL, SITE } from "@/lib/q";
import { Buy } from "@/components/cart";
import Gallery from "@/components/Gallery";
import Bundle from "@/components/Bundle";
import Card from "@/components/Card";
import Stars from "@/components/Stars";
import ReviewForm from "@/components/ReviewForm";
import Recent from "@/components/Recent";
export const dynamic = "force-dynamic";
const get = (h) => db().prepare(SEL + " AND p.handle=?").bind(h).first();
export async function generateMetadata({ params }) {
  const p = await get((await params).handle); if (!p) return {};
  const desc = p.description_html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim().slice(0, 155);
  return { title: p.title, description: desc, alternates: { canonical: "/products/" + p.handle }, openGraph: { title: p.title, description: desc, images: [p.image_url] } };
}
export default async function Product({ params }) {
  const p = await get((await params).handle);
  if (!p) notFound();
  const d = db();
  const variants = (await d.prepare("SELECT id,title,price_pence,compare_at_pence FROM variants WHERE handle=? ORDER BY position").bind(p.handle).all()).results;
  const reviews = (await d.prepare("SELECT * FROM reviews WHERE handle=? AND approved=1 ORDER BY id DESC LIMIT 20").bind(p.handle).all()).results;
  const same = (await d.prepare(SEL + " AND p.product_type=? AND p.handle<>? AND p.available=1 ORDER BY ABS(p.price_pence-?) LIMIT 12").bind(p.product_type, p.handle, p.price_pence).all()).results;
  const rooms = (await d.prepare("SELECT product_type t, COUNT(*) n, (SELECT image_url FROM products x WHERE x.product_type=p.product_type AND x.status='active' ORDER BY x.id LIMIT 1) img FROM products p WHERE status='active' GROUP BY product_type ORDER BY n DESC").all()).results;
  const partners = same.filter((x) => !x.nv).slice(0, p.nv ? 3 : 2);
  const bundle = [...(p.nv || !p.available ? [] : [p]), ...partners].map((x) => ({ handle: x.handle, title: x.title, price: x.price_pence, image: x.image_url }));
  let images = []; try { images = JSON.parse(p.images_json || "[]"); } catch {}
  if (!images.length) images = [p.image_url];
  const low = p.nv ? p.minp : p.price_pence;
  const ld = { "@context": "https://schema.org", "@type": "Product", name: p.title, image: images.map((i) => (i.startsWith("/") ? SITE + i : i)), description: p.description_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 300), brand: { "@type": "Brand", name: "Organova" }, sku: p.handle,
    offers: { "@type": "Offer", priceCurrency: "GBP", price: (low / 100).toFixed(2), availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: SITE + "/products/" + p.handle, shippingDetails: { "@type": "OfferShippingDetails", shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "GBP" }, shippingDestination: { "@type": "DefinedRegion", addressCountry: "GB" } } },
    ...(p.rc > 0 && { aggregateRating: { "@type": "AggregateRating", ratingValue: (+p.ravg).toFixed(1), reviewCount: p.rc } }) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="crumbs"><a href="/">Home</a> / <a href={"/shop?type=" + encodeURIComponent(p.product_type)}>{p.product_type}</a> / <span>{p.title}</span></div>
      <div className="pdp">
        <Gallery images={images} alt={p.title} />
        <div className="info">
          <p className="eyebrow">{p.product_type}</p>
          <h1>{p.title}</h1>
          {p.rc > 0 ? <a href="#reviews" className="rl"><Stars v={p.ravg} n={p.rc} /></a> : <a href="#reviews" className="rl muted">Be the first to review</a>}
          <Buy product={{ handle: p.handle, title: p.title, image: images[0], price: p.price_pence, compare: p.compare_at_pence, available: p.available }} variants={variants} />
          <ul className="perks"><li><b>Free UK delivery</b> · dispatched in 1–3 working days</li><li><b>14-day right to cancel</b> on most items</li><li><b>Secure checkout</b> with PayPal or card</li></ul>
          <details open><summary>Product details</summary><div className="desc" dangerouslySetInnerHTML={{ __html: p.description_html }} /></details>
          <details><summary>Delivery &amp; returns</summary><div className="desc"><p>Free standard delivery to addresses in Great Britain. Orders are processed in 1–3 business days and usually arrive 3–7 business days after dispatch.</p><p>See our <a href="/policies/shipping-policy">shipping policy</a> and <a href="/policies/refund-policy">returns policy</a>.</p></div></details>
        </div>
      </div>
      {bundle.length > 1 && <Bundle items={bundle} />}
      <section id="reviews" className="reviews"><h2>Customer reviews</h2>
        {p.rc > 0 && <p className="sum"><b>{(+p.ravg).toFixed(1)}</b> <Stars v={p.ravg} /> <span>{p.rc} review{p.rc === 1 ? "" : "s"}</span></p>}
        {reviews.map((r) => <article key={r.id} className="rv"><Stars v={r.rating} />{r.title && <h3>{r.title}</h3>}<p>{r.body}</p><small>{r.name}{r.verified ? " · Verified purchase" : ""} · {r.created_at.slice(0, 10)}</small></article>)}
        {!reviews.length && <p>No reviews yet. Bought this? Tell others what you think.</p>}
        <details className="wr"><summary className="btn ghost">Write a review</summary><ReviewForm handle={p.handle} /></details>
      </section>
      {same.length > 0 && <section><div className="sh"><h2>More from {p.product_type}</h2><a href={"/shop?type=" + encodeURIComponent(p.product_type)}>View all</a></div><div className="rail">{same.map((x) => <Card key={x.id} p={x} />)}</div></section>}
      <Recent current={p.handle} />
      <section><div className="sh"><h2>Shop by category</h2></div><div className="rooms sm">{rooms.map((r) => <a key={r.t} className="room" href={"/shop?type=" + encodeURIComponent(r.t)}><img src={r.img} alt="" loading="lazy" /><span>{r.t}</span></a>)}</div></section>
    </>
  );
}
