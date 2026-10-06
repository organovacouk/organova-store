import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SEL } from "@/lib/q";
import Card from "@/components/Card";
import Img from "@/components/Img";
import BeforeAfter from "@/components/BeforeAfter";
import Newsletter from "@/components/Newsletter";
import Stars from "@/components/Stars";
export const dynamic = "force-dynamic";
const Icon = ({ d }) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
export default async function Home({ searchParams }) {
  const { type } = await searchParams;
  if (type) redirect("/shop?type=" + encodeURIComponent(type));
  const d = db();
  const rooms = (await d.prepare("SELECT product_type t, COUNT(*) n, (SELECT image_url FROM products x WHERE x.product_type=p.product_type AND x.status='active' ORDER BY x.id LIMIT 1) img FROM products p WHERE status='active' GROUP BY product_type ORDER BY n DESC").all()).results;
  const sale = (await d.prepare(SEL + " AND p.available=1 AND p.compare_at_pence>p.price_pence ORDER BY (1.0*p.compare_at_pence/p.price_pence) DESC LIMIT 8").all()).results;
  const posts = (await d.prepare("SELECT slug,title,excerpt,image_url FROM posts WHERE published=1 ORDER BY published_at DESC LIMIT 3").all()).results;
  const reviews = (await d.prepare("SELECT r.*, p.title ptitle FROM reviews r JOIN products p ON p.handle=r.handle WHERE r.approved=1 ORDER BY r.id DESC LIMIT 3").all()).results;
  const kitchenImg = rooms.find((r) => r.t === "Kitchen")?.img;
  return (
    <>
      <section className="hero">
        <div className="hero-t">
          <p className="eyebrow">Think organised</p>
          <h1>A place for everything, room by room.</h1>
          <p className="lead">Smart, well-made storage that fits real British homes, from the under-sink gap to the hallway shoe pile.</p>
          <div className="cta"><a className="btn" href="/shop">Shop all products</a><a className="btn ghost" href="/shop?sale=1">See the sale</a></div>
          <ul className="mini"><li>Free UK delivery</li><li>Secure checkout</li><li>14-day returns</li></ul>
        </div>
        <div className="hero-i"><Img src="/img/hero-kitchen" fallback={kitchenImg} alt="An organised kitchen" /></div>
      </section>
      <section className="trust" aria-label="Why shop with us">
        <div><Icon d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01" /><b>Free UK delivery</b><span>On every order</span></div>
        <div><Icon d="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0" /><b>Fast dispatch</b><span>Within 1–3 working days</span></div>
        <div><Icon d="M4 12l5 5L20 6" /><b>Easy returns</b><span>14-day right to cancel</span></div>
        <div><Icon d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11zM12 12a2 2 0 1 0 0-.01" /><b>UK-based brand</b><span>Curated for British homes</span></div>
      </section>
      <section><div className="sh"><h2>Shop by room</h2><a href="/shop">View all</a></div>
        <div className="rooms">{rooms.map((r) => <a key={r.t} className="room" href={"/shop?type=" + encodeURIComponent(r.t)}><img src={r.img} alt="" loading="lazy" /><span>{r.t}<small>{r.n} products</small></span></a>)}</div></section>
      {sale.length > 0 && <section><div className="sh"><h2>On sale now</h2><a href="/shop?sale=1">View all</a></div><div className="rail">{sale.map((p) => <Card key={p.id} p={p} />)}</div></section>}
      <section className="split"><div><p className="eyebrow">See the difference</p><h2>Small changes. A better everyday.</h2><p>Drag the slider to see how a few smart pieces turn a cluttered kitchen into a calm one.</p><a className="btn" href="/shop?type=Kitchen">Shop the kitchen</a></div><BeforeAfter /></section>
      {reviews.length > 0 && <section><div className="sh"><h2>What customers say</h2></div><div className="revs">{reviews.map((r) => <blockquote key={r.id}><Stars v={r.rating} /><p>{r.body}</p><footer>{r.name}{r.verified ? " · Verified purchase" : ""} · <a href={"/products/" + r.handle}>{r.ptitle}</a></footer></blockquote>)}</div></section>}
      <section><div className="sh"><h2>From the journal</h2><a href="/blog">All articles</a></div>
        <div className="posts">{posts.map((p) => <a key={p.slug} className="post" href={"/blog/" + p.slug}>{p.image_url ? <Img src={p.image_url} fallback={kitchenImg} alt="" /> : <div className="ph0" />}<h3>{p.title}</h3><p>{p.excerpt}</p></a>)}</div></section>
      <section className="band"><div><h2>Get 20% off your first order</h2><p>Join our list for new arrivals and practical tips. Use code ORGANOVAFIRST at checkout.</p></div><Newsletter /></section>
    </>
  );
}
