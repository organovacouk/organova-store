"use client";
import { useState } from "react";
import { profitOf, recommend, band } from "@/lib/pricing-core";
const num = (v) => { const n = parseFloat(String(v).replace(/[£,\s]/g, "")); return Number.isFinite(n) ? Math.round(n * 100) : null; };
const gbp = (p) => "£" + (p / 100).toFixed(2);
function Profit({ price, cost, rules, onUse }) {
  const p = num(price), c = num(cost);
  if (c == null || c <= 0) return <small className="mut">Add the supplier cost to see profit.</small>;
  const rec = recommend(c, rules), r = p > 0 ? profitOf(p, c, rules) : null;
  return (
    <div style={{ marginTop: 6, fontSize: 13.5 }}>
      {r && <span className={"chip " + band(r.margin, rules)}>Profit {gbp(Math.round(r.profit))} · {r.margin.toFixed(0)}% margin</span>}
      {rec && <> <span className="mut">Suggested price {gbp(rec)}</span> <button type="button" className="b o sm" onClick={() => onUse((rec / 100).toFixed(2))}>Use</button></>}
    </div>
  );
}
export default function ProductEditor({ init, categories, rules }) {
  const [f, setF] = useState(init); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [up, setUp] = useState(false); const [ai, setAi] = useState(""); 
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const hasV = f.variants.length > 0;
  async function upload(e) {
    setUp(true); setErr(""); const urls = [];
    for (const file of e.target.files) { const fd = new FormData(); fd.append("file", file); const r = await fetch("/api/admin/upload", { method: "POST", body: fd }); const j = await r.json(); if (r.ok) urls.push(j.url); else setErr(j.error || "Upload failed"); }
    setF((x) => ({ ...x, images: [...x.images, ...urls] })); setUp(false); e.target.value = "";
  }
  const mv = (i, d) => { const a = [...f.images]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setF({ ...f, images: a }); };
  const setV = (i, k, v) => setF({ ...f, variants: f.variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
  async function rewrite() {
    setAi("Rewriting…"); setErr("");
    const r = await fetch("/api/admin/ai-rewrite", { method: "POST", body: JSON.stringify({ title: f.title, description: f.description }) }); const j = await r.json();
    if (r.ok) { setF({ ...f, title: j.title, description: j.description }); setAi("Rewritten. Please read it carefully before saving."); } else { setAi(""); setErr(j.error || "Rewrite failed"); }
  }
  async function save() {
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/product", { method: "POST", body: JSON.stringify(f) }); const j = await r.json(); setBusy(false);
    if (r.ok) location.href = "/admin/products/" + j.id + "?saved=1"; else setErr(j.error || "Could not save");
  }
  return (
    <div className="g2">
      <div>
        <div className="card"><label>Title<input value={f.title} onChange={set("title")} /></label>
          <label>Description <span className="h">(HTML allowed: &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;)</span><textarea style={{ minHeight: 220 }} value={f.description} onChange={set("description")} /></label>
          <button type="button" className="b o sm" onClick={rewrite} disabled={!f.title || !f.description}>✨ Rewrite title and description with AI</button> <span className="mut">{ai}</span>
          <p className="mut" style={{ margin: "6px 0 0" }}>Supplier text is often copied by other shops. A rewrite makes yours original. Always check it for accuracy.</p></div>
        <div className="card"><h2>Images</h2><p className="mut">The first image is the main one. Use the arrows to reorder.</p>
          <div className="imgs">{f.images.map((u, i) => <figure key={u} className={i === 0 ? "main" : ""}><img src={u} alt="" /><figcaption><button onClick={() => mv(i, -1)} aria-label="Move left">←</button><button onClick={() => mv(i, 1)} aria-label="Move right">→</button><button onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} aria-label="Remove">✕</button></figcaption></figure>)}</div>
          <label>{up ? "Uploading…" : "Upload images (JPG, PNG, WebP, max 6 MB each)"}<input type="file" accept="image/*" multiple onChange={upload} /></label></div>
        <div className="card"><h2>Pricing and profit</h2>
          {!hasV && (<>
            <div className="row3"><label>Supplier cost (£)<span className="h">what AliExpress charges you, with shipping</span><input value={f.cost} onChange={set("cost")} inputMode="decimal" /></label>
              <label>Selling price (£)<input value={f.price} onChange={set("price")} inputMode="decimal" /></label>
              <label>Compare-at price (£)<span className="h">only a genuine earlier price</span><input value={f.compare} onChange={set("compare")} inputMode="decimal" /></label></div>
            <Profit price={f.price} cost={f.cost} rules={rules} onUse={(v) => setF({ ...f, price: v })} /></>)}
          {hasV && <p className="mut">This product has options, so set cost and price on each option below.</p>}
          <p className="mut" style={{ margin: "10px 0 0" }}>Profit allows for payment fees, a returns buffer{rules.vat ? " and VAT" : ""}. Change the rules under <a href="/admin/pricing">Pricing</a>. A "compare-at" price shows as a struck-through "was" price, and under UK rules it must be a price you genuinely charged recently, so leave it blank otherwise.</p></div>
        <div className="card"><h2>Options <span className="mut" style={{ fontWeight: 400, fontSize: 14 }}>(sizes, colours, packs)</span></h2>
          {hasV && <div className="vr mut" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}><span>Option name</span><span>Cost £</span><span>Price £</span><span>Compare-at £</span><span /></div>}
          {f.variants.map((v, i) => (<div key={i} style={{ marginBottom: 8 }}><div className="vr" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto", marginBottom: 2 }}>
            <input value={v.title} onChange={(e) => setV(i, "title", e.target.value)} placeholder="e.g. Black, 3 tier" /><input value={v.cost} onChange={(e) => setV(i, "cost", e.target.value)} inputMode="decimal" /><input value={v.price} onChange={(e) => setV(i, "price", e.target.value)} inputMode="decimal" /><input value={v.compare} onChange={(e) => setV(i, "compare", e.target.value)} inputMode="decimal" />
            <button className="b o sm" onClick={() => setF({ ...f, variants: f.variants.filter((_, j) => j !== i) })}>✕</button></div>
            <Profit price={v.price} cost={v.cost} rules={rules} onUse={(x) => setV(i, "price", x)} /></div>))}
          <button className="b o sm" onClick={() => setF({ ...f, variants: [...f.variants, { title: "", price: f.price, compare: f.compare, cost: f.cost }] })}>+ Add option</button></div>
      </div>
      <div>
        <div className="card"><h2>Status</h2>
          <label>Visibility<select value={f.status} onChange={set("status")}><option value="active">Live on the store</option><option value="draft">Draft (hidden)</option><option value="archived">Archived (hidden)</option></select></label>
          <label>Stock<select value={f.available} onChange={(e) => setF({ ...f, available: +e.target.value })}><option value="1">In stock</option><option value="0">Sold out</option></select></label></div>
        <div className="card"><h2>Organisation</h2>
          <label>Category<input list="cats" value={f.category} onChange={set("category")} /><datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist></label>
          <label>Tags <span className="h">comma separated, used by search</span><input value={f.tags} onChange={set("tags")} /></label>
          <label>Brand<input value={f.vendor} onChange={set("vendor")} /></label>
          <label>Supplier link <span className="h">AliExpress / supplier page, shown on orders</span><input value={f.supplier_url} onChange={set("supplier_url")} placeholder="https://…" /></label>
          {f.id && <label>Web address<input value={"/products/" + f.handle} readOnly /></label>}</div>
      </div>
      <div className="sticky" style={{ gridColumn: "1/-1" }}><button className="b" onClick={save} disabled={busy || up}>{busy ? "Saving…" : "Save product"}</button>{err && <span className="err">{err}</span>}
        {f.id && <button className="b o" onClick={() => { if (confirm("Archive this product? It disappears from the store.")) { fetch("/api/admin/do", { method: "POST", body: new URLSearchParams({ action: "archive", id: f.id }) }).then(() => (location.href = "/admin/products")); } }}>Archive</button>}</div>
    </div>
  );
}
