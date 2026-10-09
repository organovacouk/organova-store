"use client";
import { useState } from "react";
export default function ProductEditor({ init, categories }) {
  const [f, setF] = useState(init); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [up, setUp] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const hasV = f.variants.length > 0;
  async function upload(e) {
    setUp(true); setErr(""); const urls = [];
    for (const file of e.target.files) { const fd = new FormData(); fd.append("file", file); const r = await fetch("/api/admin/upload", { method: "POST", body: fd }); const j = await r.json(); if (r.ok) urls.push(j.url); else setErr(j.error || "Upload failed"); }
    setF((x) => ({ ...x, images: [...x.images, ...urls] })); setUp(false); e.target.value = "";
  }
  const mv = (i, d) => { const a = [...f.images]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setF({ ...f, images: a }); };
  const setV = (i, k, v) => setF({ ...f, variants: f.variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
  async function save() {
    setBusy(true); setErr("");
    const r = await fetch("/api/admin/product", { method: "POST", body: JSON.stringify(f) }); const j = await r.json(); setBusy(false);
    if (r.ok) location.href = "/admin/products/" + j.id + "?saved=1"; else setErr(j.error || "Could not save");
  }
  return (
    <div className="g2">
      <div>
        <div className="card"><label>Title<input value={f.title} onChange={set("title")} /></label>
          <label>Description <span className="h">(HTML allowed: &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;)</span><textarea style={{ minHeight: 220 }} value={f.description} onChange={set("description")} /></label></div>
        <div className="card"><h2>Images</h2><p className="mut">The first image is the main one. Use the arrows to reorder.</p>
          <div className="imgs">{f.images.map((u, i) => <figure key={u} className={i === 0 ? "main" : ""}><img src={u} alt="" /><figcaption><button onClick={() => mv(i, -1)} aria-label="Move left">←</button><button onClick={() => mv(i, 1)} aria-label="Move right">→</button><button onClick={() => setF({ ...f, images: f.images.filter((_, j) => j !== i) })} aria-label="Remove">✕</button></figcaption></figure>)}</div>
          <label>{up ? "Uploading…" : "Upload images (JPG, PNG, WebP, max 6 MB each)"}<input type="file" accept="image/*" multiple onChange={upload} /></label></div>
        <div className="card"><h2>Pricing</h2>
          <div className="row2"><label>Price (£){hasV && <span className="h"> — ignored while options are set</span>}<input value={f.price} onChange={set("price")} inputMode="decimal" /></label><label>Compare-at price (£) <span className="h">original price, shown struck through</span><input value={f.compare} onChange={set("compare")} inputMode="decimal" /></label></div></div>
        <div className="card"><h2>Options <span className="mut" style={{ fontWeight: 400, fontSize: 14 }}>(sizes, colours, packs)</span></h2>
          {hasV && <div className="vr mut"><span>Option name</span><span>Price £</span><span>Compare-at £</span><span /></div>}
          {f.variants.map((v, i) => <div className="vr" key={i}><input value={v.title} onChange={(e) => setV(i, "title", e.target.value)} placeholder="e.g. Black, 3 tier" /><input value={v.price} onChange={(e) => setV(i, "price", e.target.value)} inputMode="decimal" /><input value={v.compare} onChange={(e) => setV(i, "compare", e.target.value)} inputMode="decimal" /><button className="b o sm" onClick={() => setF({ ...f, variants: f.variants.filter((_, j) => j !== i) })}>✕</button></div>)}
          <button className="b o sm" onClick={() => setF({ ...f, variants: [...f.variants, { title: "", price: f.price, compare: f.compare }] })}>+ Add option</button></div>
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
