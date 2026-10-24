"use client";
import { useState } from "react";
export default function AeTools({ connected }) {
  const [input, setInput] = useState(""), [res, setRes] = useState(null), [busy, setBusy] = useState(false);
  async function test(e) { e.preventDefault(); setBusy(true); setRes(null); const r = await fetch("/api/admin/ae/test", { method: "POST", body: JSON.stringify({ input }) }); setRes(await r.json()); setBusy(false); }
  const s = res?.summary;
  return (
    <form className="card" onSubmit={test}><h2>Test with a real product</h2>
      <p className="mut">Paste any AliExpress product link. This checks that signing, your token and API permission all work.</p>
      <label>AliExpress product link or ID<input value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://www.aliexpress.com/item/1005001234567890.html" /></label>
      <button className="b" disabled={!connected || busy || !input}>{busy ? "Looking up…" : "Look up product"}</button>
      {!connected && <p className="mut">Connect your AliExpress account first.</p>}
      {res && (res.ok ? (
        <div style={{ marginTop: 14 }}><p className="ok"><b>It works.</b> AliExpress returned this product:</p>
          <table><tbody>
            <tr><td>Title</td><td>{s.title}</td></tr><tr><td>Status</td><td>{s.status}</td></tr>
            <tr><td>Price range</td><td>{s.priceFrom != null ? `${s.currency || ""} ${s.priceFrom}${s.priceTo !== s.priceFrom ? " – " + s.priceTo : ""}` : "not found"}</td></tr>
            <tr><td>Options (SKUs)</td><td>{s.options}</td></tr><tr><td>Total stock</td><td>{s.stock}</td></tr><tr><td>Images</td><td>{s.images}</td></tr><tr><td>Delivery</td><td>{String(s.delivery ?? "not shown")}</td></tr></tbody></table></div>
      ) : <p className="err" style={{ marginTop: 14 }}>{res.error || "AliExpress answered, but I could not read a product from it. Open the raw reply below and send it to me."}</p>)}
      {res?.raw && <details style={{ marginTop: 12 }}><summary>Raw reply from AliExpress (send this to me if something looks wrong)</summary><pre style={{ maxHeight: 320, overflow: "auto" }}>{res.raw}</pre></details>}
    </form>
  );
}
