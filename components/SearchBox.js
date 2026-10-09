"use client";
import { useEffect, useRef, useState } from "react";
const gbp = (p) => "£" + (p / 100).toFixed(2);
export default function SearchBox() {
  const [q, setQ] = useState(""), [res, setRes] = useState(null), [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return; }
    const t = setTimeout(() => fetch("/api/search?q=" + encodeURIComponent(q)).then((r) => r.json()).then((j) => { setRes(j); setOpen(true); }).catch(() => {}), 200);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => { const f = (e) => { if (!box.current?.contains(e.target)) setOpen(false); }; document.addEventListener("click", f); return () => document.removeEventListener("click", f); }, []);
  return (
    <form action="/search" className="search" role="search" ref={box} onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <input name="q" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => res && setOpen(true)} placeholder="Search storage, racks, shelves…" aria-label="Search" autoComplete="off" />
      <button aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></button>
      {open && res && (
        <div className="sugg" role="listbox">
          {res.cats.map((c) => <a key={c} href={"/shop?type=" + encodeURIComponent(c)} className="sc">Browse <b>{c}</b></a>)}
          {res.products.map((p) => <a key={p.handle} href={"/products/" + p.handle}><img src={p.image} alt="" /><span>{p.title}</span><b>{p.from ? "from " : ""}{gbp(p.price)}</b></a>)}
          {!res.products.length && !res.cats.length && <p>No matches. Try a simpler word.</p>}
          {res.products.length > 0 && <a className="all" href={"/search?q=" + encodeURIComponent(q)}>See all results for “{q}”</a>}
        </div>)}
    </form>
  );
}
