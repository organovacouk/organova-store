import { db } from "@/lib/db";
import { money } from "@/lib/admin";
export default async function Products({ searchParams }) {
  const { q = "", cat = "", s = "" } = await searchParams;
  const d = db();
  const cats = (await d.prepare("SELECT DISTINCT product_type t FROM products WHERE product_type<>'' ORDER BY t").all()).results;
  const cond = s === "out" ? "status='active' AND available=0" : s === "draft" ? "status='draft'" : s === "archived" ? "status='archived'" : s === "active" ? "status='active'" : "status<>'archived'";
  const rows = (await d.prepare(`SELECT p.*, (SELECT MIN(price_pence) FROM variants v WHERE v.handle=p.handle) minp, (SELECT COUNT(*) FROM variants v WHERE v.handle=p.handle) nv FROM products p WHERE ${cond} AND (?1='' OR title LIKE '%'||?1||'%') AND (?2='' OR product_type=?2) ORDER BY id DESC LIMIT 300`).bind(q, cat).all()).results;
  const link = (o) => "?" + new URLSearchParams({ q, cat, s, ...o });
  return (
    <>
      <div className="top"><h1>Products</h1><a className="b" href="/admin/products/new">+ Add product</a></div>
      <form method="get" className="card" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
        <label style={{ margin: 0 }}>Search<input name="q" defaultValue={q} placeholder="Product name" /></label>
        <label style={{ margin: 0 }}>Category<select name="cat" defaultValue={cat}><option value="">All</option>{cats.map((c) => <option key={c.t}>{c.t}</option>)}</select></label>
        <label style={{ margin: 0 }}>Show<select name="s" defaultValue={s}><option value="">Not archived</option><option value="active">Live</option><option value="out">Sold out</option><option value="draft">Draft</option><option value="archived">Archived</option></select></label>
        <button className="b">Filter</button></form>
      <div className="card tw"><table><thead><tr><th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>
        {rows.map((p) => <tr className="row" key={p.id}><td><img className="thumb" src={p.image_url} alt="" /></td><td><a href={"/admin/products/" + p.id}><b>{p.title.slice(0, 70)}</b></a>{p.nv > 0 && <small className="mut"> · {p.nv} options</small>}</td><td>{p.product_type}</td><td>{p.nv ? "from " + money(p.minp) : money(p.price_pence)}</td>
          <td><form method="post" action="/api/admin/do"><input type="hidden" name="action" value="stock" /><input type="hidden" name="id" value={p.id} /><input type="hidden" name="available" value={p.available ? 0 : 1} /><button className={"chip " + (p.available ? "good" : "bad")} style={{ border: 0, cursor: "pointer" }} title="Click to toggle">{p.available ? "In stock" : "Sold out"}</button></form></td>
          <td><span className={"chip " + (p.status === "active" ? "good" : "warn")}>{p.status}</span></td><td><a className="b o sm" href={"/admin/products/" + p.id}>Edit</a></td></tr>)}
        {!rows.length && <tr><td colSpan="7" className="mut">No products match.</td></tr>}</tbody></table></div>
    </>
  );
}
