import { aeStatus } from "@/lib/ae";
import AeTools from "@/components/admin/AeTools";
const when = (ms) => (ms ? new Date(ms).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "unknown");
export default async function Dropship({ searchParams }) {
  const sp = await searchParams; const s = await aeStatus();
  const soon = s.connected && s.accessExp && s.accessExp < Date.now();
  return (
    <>
      <div className="top"><h1>Dropshipping: AliExpress</h1></div>
      {sp.connected && <p className="ok">AliExpress connected.</p>}
      {sp.error && <p className="err">{sp.error}</p>}
      <div className="card"><h2>Connection</h2>
        <table><tbody>
          <tr><td>App key and secret</td><td><span className={"chip " + (s.configured ? "good" : "warn")}>{s.configured ? "Added" : "Missing"}</span> <span className="mut">{s.configured ? "" : "Add AE_APP_KEY and AE_APP_SECRET as Secrets in Cloudflare."}</span></td></tr>
          <tr><td>AliExpress account</td><td><span className={"chip " + (s.connected ? "good" : "warn")}>{s.connected ? "Connected" : "Not connected"}</span> {s.account && <span className="mut">{s.account}</span>}</td></tr>
          {s.connected && <tr><td>Access token</td><td>{soon ? "Expired (renews automatically when used)" : "Valid until " + when(s.accessExp)}</td></tr>}
          {s.connected && <tr><td>Connection valid until</td><td>{s.refreshExp ? when(s.refreshExp) : "not stated by AliExpress"}</td></tr>}
        </tbody></table>
        <p style={{ marginTop: 14 }}>
          <a className="b" href="/api/admin/ae/connect" aria-disabled={!s.configured}>{s.connected ? "Reconnect AliExpress" : "Connect AliExpress"}</a>{" "}
          {s.connected && <form method="post" action="/api/admin/ae/refresh" style={{ display: "inline" }}><button className="b o">Refresh token now</button></form>}{" "}
          {s.connected && <form method="post" action="/api/admin/ae/disconnect" style={{ display: "inline" }}><button className="b o">Disconnect</button></form>}
        </p>
        <p className="mut">When you click Connect, AliExpress asks you to sign in with the AliExpress account you use to buy dropshipping stock, and to approve this app. Use this admin on the same web address you registered as the callback URL.</p>
      </div>
      <AeTools connected={s.connected} />
    </>
  );
}
