import { db } from "@/lib/db";
export default async function Categories({ searchParams }) {
  const { done } = await searchParams;
  const rows = (await db().prepare("SELECT product_type t, COUNT(*) n, SUM(status='active') live FROM products WHERE product_type<>'' GROUP BY product_type ORDER BY n DESC").all()).results;
  return (<><div className="top"><h1>Categories</h1></div>{done && <p className="ok">Category renamed.</p>}
    <div className="card"><p className="mut">A category exists when a product uses it. Create new ones by typing a new name in a product. Rename or merge here (renaming to an existing name merges them). The top menu links to Kitchen, Bathroom, Bedroom &amp; Wardrobe, Hallway &amp; Shoes and Living Room &amp; General, so tell me before renaming those.</p>
      <table><thead><tr><th>Category</th><th>Products</th><th>Live</th><th>Rename / merge into</th></tr></thead><tbody>{rows.map((c) => <tr key={c.t}><td><a href={"/admin/products?cat=" + encodeURIComponent(c.t)}>{c.t}</a></td><td>{c.n}</td><td>{c.live}</td>
        <td><form method="post" action="/api/admin/do" style={{ display: "flex", gap: 8 }}><input type="hidden" name="action" value="category_rename" /><input type="hidden" name="from" value={c.t} /><input name="to" placeholder="New name" required /><button className="b o sm">Rename</button></form></td></tr>)}</tbody></table></div></>);
}
