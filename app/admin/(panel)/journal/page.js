import { db } from "@/lib/db";
export default async function Journal() {
  const rows = (await db().prepare("SELECT id,slug,title,published,published_at FROM posts ORDER BY published_at DESC").all()).results;
  return (<><div className="top"><h1>Journal</h1><a className="b" href="/admin/journal/new">+ New article</a></div>
    <div className="card tw"><table><thead><tr><th>Title</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>{rows.map((p) => <tr className="row" key={p.id}><td><a href={"/admin/journal/" + p.id}><b>{p.title}</b></a></td><td>{p.published_at}</td><td><span className={"chip " + (p.published ? "good" : "warn")}>{p.published ? "Published" : "Draft"}</span></td><td><a className="b o sm" href={"/admin/journal/" + p.id}>Edit</a> {p.published ? <a className="b o sm" href={"/blog/" + p.slug} target="_blank">View ↗</a> : null}</td></tr>)}</tbody></table></div></>);
}
