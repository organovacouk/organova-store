import { db, env } from "@/lib/db";
import { googleConfigured } from "@/lib/google";
import { adminEmail } from "@/lib/admin";
import Confirm from "@/components/admin/Confirm";
export default async function Team({ searchParams }) {
  const { msg, err } = await searchParams; const admins = (await db().prepare("SELECT * FROM admins ORDER BY id").all()).results; const me = await adminEmail(); const g = googleConfigured();
  return (<><div className="top"><h1>Team</h1></div>{msg && <p className="ok">{msg}</p>}{err && <p className="err">{err}</p>}
    <div className="card"><h2>How people sign in</h2>
      <table><tbody><tr><td>Google sign-in</td><td><span className={"chip " + (g ? "good" : "warn")}>{g ? "On" : "Not set up"}</span> <span className="mut">{g ? "Only the Google accounts listed below can use it." : "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET as Secrets in Cloudflare."}</span></td></tr>
        <tr><td>Shared admin password</td><td><span className={"chip " + (env().ADMIN_PASSWORD ? "warn" : "good")}>{env().ADMIN_PASSWORD ? "Still active" : "Removed"}</span> <span className="mut">{env().ADMIN_PASSWORD ? "Works with the email box left blank. Once your own account works, delete the ADMIN_PASSWORD secret in Cloudflare." : ""}</span></td></tr></tbody></table></div>
    <div className="card tw"><h2>Admins</h2><table><thead><tr><th>Email</th><th>Password</th><th>Last sign-in</th><th>Set or reset password</th><th></th></tr></thead><tbody>
      {admins.map((a) => <tr key={a.id}><td><b>{a.email}</b>{a.email === me ? " (you)" : ""}<br /><small className="mut">{a.name}</small></td><td>{a.password_hash ? "Set" : "Google only"}</td><td>{(a.last_login || "never").slice(0, 16)}</td>
        <td><form method="post" action="/api/admin/team" style={{ display: "flex", gap: 6 }}><input type="hidden" name="action" value="setpw" /><input type="hidden" name="id" value={a.id} /><input name="password" type="password" placeholder="New password" autoComplete="new-password" style={{ minWidth: 150 }} /><button className="b o sm">Save</button></form></td>
        <td><form method="post" action="/api/admin/team"><input type="hidden" name="action" value="remove" /><input type="hidden" name="id" value={a.id} /><Confirm msg={"Remove " + a.email + " as an admin?"}>Remove</Confirm></form></td></tr>)}
      {!admins.length && <tr><td colSpan="5" className="mut">No named admins yet. Add yourself below, using the Google account you will sign in with.</td></tr>}</tbody></table></div>
    <form className="card" method="post" action="/api/admin/team" style={{ maxWidth: 560 }}><h2>Add an admin</h2><input type="hidden" name="action" value="add" />
      <label>Email (the Google account they use)<input name="email" type="email" required /></label><label>Name<input name="name" /></label>
      <label>Password <span className="h">optional. Leave blank for Google-only. At least 10 characters.</span><input name="password" type="password" autoComplete="new-password" /></label>
      <button className="b">Add admin</button><p className="mut" style={{ margin: "10px 0 0" }}>Admins can see and change everything: orders, customers, products and settings. Only add people you trust.</p></form></>);
}
