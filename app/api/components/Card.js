import Stars from "./Stars";
import Wish from "./Wish";
import { gbp } from "@/lib/db-format";
export default function Card({ p }) {
  const price = p.nv ? p.minp : p.price_pence;
  const sale = !p.nv && p.compare_at_pence > p.price_pence;
  return (
    <div className="cw"><a className="card" href={"/products/" + p.handle}>
      <div className="ph">
        <img src={p.image_url} alt={p.title} loading="lazy" />
        {!p.available ? <span className="tag out">Sold out</span> : sale ? <span className="tag">-{Math.round((1 - p.price_pence / p.compare_at_pence) * 100)}%</span> : null}
      </div>
      <div className="meta">
        <h3>{p.title}</h3>
        {p.rc > 0 && <Stars v={p.ravg} n={p.rc} />}
        <p><span className="price">{p.nv ? "From " : ""}{gbp(price)}</span>{sale && <span className="was">{gbp(p.compare_at_pence)}</span>}</p>
      </div>
    </a><Wish handle={p.handle} /></div>
  );
}
