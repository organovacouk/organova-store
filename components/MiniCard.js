const gbp = (p) => "£" + (p / 100).toFixed(2);
export default function MiniCard({ p, children }) {
  return (
    <div className="cw"><a className="card" href={"/products/" + p.handle}>
      <div className="ph"><img src={p.image} alt={p.title} loading="lazy" />{!p.available && <span className="tag out">Sold out</span>}</div>
      <div className="meta"><h3>{p.title}</h3><p><span className="price">{p.from ? "From " : ""}{gbp(p.price)}</span>{p.compare > p.price && <span className="was">{gbp(p.compare)}</span>}</p></div></a>{children}</div>
  );
}
