import { db } from "@/lib/db";
import Stars from "@/components/Stars";
import Confirm from "@/components/admin/Confirm";
export default async function Reviews({ searchParams }) {
  const { f = "pending" } = await searchParams;
  const rows = (await db().prepare("SELECT r.*, p.title pt FROM reviews r LEFT JOIN products p ON p.handle=r.handle WHERE approved=? ORDER BY r.id DESC LIMIT 100").bind(f === "approved" ? 1 : 0).all()).results;
  const btn = (act, id, label, cls = "b sm") => <form method="post" action="/api/admin/do" style={{ display: "inline" }}><input type="hidden" name="action" value={act} /><input type="hidden" name="id" value={id} /><button className={cls}>{label}</button></form>;
  return (<><div className="top"><h1>Reviews</h1></div><div className="tabs"><a href="?f=pending" className={f !== "approved" ? "on" : ""}>Awaiting approval</a><a href="?f=approved" className={f === "approved" ? "on" : ""}>Published</a></div>
    {rows.map((r) => <div className="card" key={r.id}><Stars v={r.rating} /> <b>{r.title}</b><p>{r.body}</p><p className="mut">{r.name} · {r.email} · {r.verified ? <span className="chip good">Verified purchase</span> : <span className="chip">Not matched to an order</span>} · on <a href={"/products/" + r.handle} target="_blank">{r.pt || r.handle}</a></p>
      {f === "approved" ? btn("review_unapprove", r.id, "Unpublish", "b o sm") : btn("review_approve", r.id, "Approve & publish")} <form method="post" action="/api/admin/do" style={{ display: "inline" }}><input type="hidden" name="action" value="review_delete" /><input type="hidden" name="id" value={r.id} /><Confirm msg="Delete this review?">Delete</Confirm></form></div>)}
    {!rows.length && <div className="card mut">Nothing here.</div>}</>);
}
