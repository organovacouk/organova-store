"use client";
import { useState } from "react";
export default function PostEditor({ init }) {
  const [f, setF] = useState(init); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function upload(e) { const fd = new FormData(); fd.append("file", e.target.files[0]); const r = await fetch("/api/admin/upload", { method: "POST", body: fd }); const j = await r.json(); if (r.ok) setF({ ...f, image_url: j.url }); else setErr(j.error); }
  async function save() { setBusy(true); setErr(""); const r = await fetch("/api/admin/post", { method: "POST", body: JSON.stringify(f) }); const j = await r.json(); setBusy(false); if (r.ok) location.href = "/admin/journal/" + j.id + "?saved=1"; else setErr(j.error || "Could not save"); }
  return (
    <div className="g2"><div className="card"><label>Title<input value={f.title} onChange={set("title")} /></label><label>Short summary <span className="h">shown on the journal page and in search results</span><textarea style={{ minHeight: 70 }} value={f.excerpt} onChange={set("excerpt")} /></label>
      <label>Article <span className="h">## Heading, - bullet points, **bold**, [link text](/shop)</span><textarea style={{ minHeight: 360 }} value={f.body} onChange={set("body")} /></label></div>
      <div><div className="card"><h2>Publishing</h2><label>Status<select value={f.published} onChange={(e) => setF({ ...f, published: +e.target.value })}><option value="1">Published</option><option value="0">Draft</option></select></label><label>Date<input type="date" value={f.published_at} onChange={set("published_at")} /></label>
        {f.id && <label>Web address<input readOnly value={"/blog/" + f.slug} /></label>}</div>
        <div className="card"><h2>Cover image</h2>{f.image_url && <img src={f.image_url} alt="" style={{ width: "100%", borderRadius: 10 }} />}<label>Upload<input type="file" accept="image/*" onChange={upload} /></label><label>or image address<input value={f.image_url} onChange={set("image_url")} placeholder="/img/…" /></label></div></div>
      <div className="sticky" style={{ gridColumn: "1/-1" }}><button className="b" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save article"}</button>{err && <span className="err">{err}</span>}</div></div>
  );
}
