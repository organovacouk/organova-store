import { db, gbp } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Home({ searchParams }) {
  const { type } = await searchParams;
  const d = db();
  const cats = (await d.prepare("SELECT product_type t, COUNT(*) n FROM products WHERE status='active' AND product_type<>'' GROUP BY t ORDER BY n DESC").all()).results;
  const q = type ? d.prepare("SELECT * FROM products WHERE status='active' AND product_type=? ORDER BY id").bind(type)
                 : d.prepare("SELECT * FROM products WHERE status='active' ORDER BY id");
  const items = (await q.all()).results;
  return (
    <>
      <h1>Storage that fits the way you live</h1>
      <nav className="cats">
        <a href="/" className={!type ? "on" : ""}>All</a>
        {cats.map((c) => <a key={c.t} href={"/?type=" + encodeURIComponent(c.t)} className={type === c.t ? "on" : ""}>{c.t}</a>)}
      </nav>
      <div className="grid">
        {items.map((p) => (
          <a key={p.id} className="card" href={"/products/" + p.handle}>
            <img src={p.image_url} alt={p.title} loading="lazy" />
            <div><h3>{p.title}</h3>
              <span className="price">{gbp(p.price_pence)}</span>
              {p.compare_at_pence && <span className="was">{gbp(p.compare_at_pence)}</span>}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
