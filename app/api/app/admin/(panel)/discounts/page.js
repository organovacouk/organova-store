import { db } from "@/lib/db";
import Confirm from "@/components/admin/Confirm";
export default async function Discounts() {
  const rows = (await db().prepare("SELECT d.*, (SELECT COUNT(*) FROM orders o WHERE o.status='paid' AND UPPER(o.discount_code)=UPPER(d.code)) uses FROM discounts d ORDER BY code").all()).results;
  return (<><div className="top"><h1>Discount codes</h1></div>
    <div className="g2"><div className="card tw"><table><thead><tr><th>Code</th><th>Discount</th><th>Rule</th><th>Used</th><th>Status</th><th></th></tr></thead><tbody>
      {rows.map((r) => <tr key={r.code}><td><b>{r.code}</b></td><td>{r.percent}% off</td><td>{r.first_order_only ? "First order only" : "Any order"}</td><td>{r.uses}</td><td><span className={"chip " + (r.active ? "good" : "bad")}>{r.active ? "Active" : "Off"}</span></td>
        <td style={{ whiteSpace: "nowrap" }}><form method="post" action="/api/admin/do" style={{ display: "inline" }}><input type="hidden" name="action" value="discount_toggle" /><input type="hidden" name="code" value={r.code} /><button className="b o sm">{r.active ? "Turn off" : "Turn on"}</button></form> <form method="post" action="/api/admin/do" style={{ display: "inline" }}><input type="hidden" name="action" value="discount_delete" /><input type="hidden" name="code" value={r.code} /><Confirm msg="Delete this code?">Delete</Confirm></form></td></tr>)}
      {!rows.length && <tr><td colSpan="6" className="mut">No codes yet.</td></tr>}</tbody></table></div>
    <form className="card" method="post" action="/api/admin/do"><h2>New code</h2><input type="hidden" name="action" value="discount_add" />
      <label>Code<input name="code" placeholder="SUMMER10" required pattern="[A-Za-z0-9_-]{3,30}" /></label><label>Percent off<input name="percent" type="number" min="1" max="90" defaultValue="10" required /></label>
      <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="first" style={{ width: "auto" }} /> First order only (checked by customer email)</label><button className="b">Create code</button></form></div></>);
}
