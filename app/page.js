import { db, gbp } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Home({ searchParams }) {
  const { type } = await searchParams;
  const d = db();
  const rooms = (await d.prepare("SELECT product_type t, COUNT(*) n, (SELECT image_url FROM products x WHERE x.product_type=p.product_type AND x.status='active' ORDER BY x.id LIMIT 1) img FROM products p WHERE status='active' GROUP BY product_type ORDER BY n DESC").all()).results;
  const sel = "SELECT p.*, (SELECT COUNT(*) FROM variants v WHERE v.handle=p.handle) nv, (SELECT MIN(price_pence) FROM variants v WHERE v.handle=p.handle) minp FROM products p WHERE p.status='active'";
  const q = type ? d.prepare(sel + " AND p.product_type=? ORDER BY p.id").bind(type) : d.prepare(sel + " ORDER BY p.id");
  const items = (await q.all()).results;
  return (
    <>
      {!type && (<>
        <section className="hero">
          <h1>A place for everything, room by room.</h1>
          <p>Storage that fits real UK homes: from the under-sink gap to the hallway shoe pile.</p>
          <div className="rooms">
            {rooms.map((r) => (
              <a key={r.t} className="room" href={"/?type=" + encodeURIComponent(r.t)}>
                <img src={r.img} alt="" /><span>{r.t}<small>{r.n} products</small></span>
              </a>
            ))}
          </div>
        </section>
        <div className="trust"><span>Secure PayPal checkout</span><span>Clear prices, no hidden extras</span><span>Easy returns within 14 days</span></div>
      </>)}
      <h2>{type || "All products"}</h2>
      {type && <nav className="cats"><a href="/">All rooms</a>{rooms.map((r) => <a key={r.t} href={"/?type=" + encodeURIComponent(r.t)} className={type === r.t ? "on" : ""}>{r.t}</a>)}</nav>}
      <div className="grid">
        {items.map((p) => {
          const price = p.nv ? p.minp : p.price_pence;
          return (
            <a key={p.id} className="card" href={"/products/" + p.handle}>
              <img src={p.image_url} alt={p.title} loading="lazy" />
              <div><h3>{p.title}</h3>
                <span className="price">{p.nv ? "From " : ""}{gbp(price)}</span>
                {!p.nv && p.compare_at_pence && <span className="was">{gbp(p.compare_at_pence)}</span>}
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}
