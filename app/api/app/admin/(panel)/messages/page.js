import { db } from "@/lib/db";
export default async function Messages({ searchParams }) {
  const { f = "open" } = await searchParams;
  const rows = (await db().prepare("SELECT * FROM messages WHERE handled=? ORDER BY id DESC LIMIT 100").bind(f === "done" ? 1 : 0).all()).results;
  return (<><div className="top"><h1>Messages</h1></div><div className="tabs"><a href="?f=open" className={f !== "done" ? "on" : ""}>Open</a><a href="?f=done" className={f === "done" ? "on" : ""}>Done</a></div>
    {rows.map((m) => <div className="card" key={m.id}><p className="mut">{m.created_at} · <b>{m.name || "No name"}</b> · {m.email}{m.phone ? " · " + m.phone : ""}</p><p style={{ whiteSpace: "pre-wrap" }}>{m.body}</p>
      <a className="b sm" href={"mailto:" + m.email + "?subject=Re: your message to Organova"}>Reply by email</a> <form method="post" action="/api/admin/do" style={{ display: "inline" }}><input type="hidden" name="action" value="message_toggle" /><input type="hidden" name="id" value={m.id} /><button className="b o sm">{m.handled ? "Reopen" : "Mark as done"}</button></form></div>)}
    {!rows.length && <div className="card mut">No messages.</div>}</>);
}
