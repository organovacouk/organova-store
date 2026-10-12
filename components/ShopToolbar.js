"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
const RANGES = [["Under £20", "", "20"], ["£20 – £50", "20", "50"], ["£50 – £100", "50", "100"], ["£100+", "100", ""]];
export default function ShopToolbar({ count }) {
  const router = useRouter(); const sp = useSearchParams(); const path = usePathname() || "/shop"; const key = sp.toString();
  const [open, setOpen] = useState(false);
  const read = () => ({ min: sp.get("min") || "", max: sp.get("max") || "", stock: sp.get("stock") === "1", sale: sp.get("sale") === "1" });
  const [f, setF] = useState(read());
  useEffect(() => setF(read()), [key]);
  useEffect(() => {
    const set = () => { const h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); };
    set(); window.addEventListener("resize", set); return () => window.removeEventListener("resize", set);
  }, []);
  useEffect(() => { const k = (e) => e.key === "Escape" && setOpen(false); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, []);
  const go = (patch) => { const q = new URLSearchParams(sp.toString()); for (const [k, v] of Object.entries(patch)) { if (v === "" || v === false || v == null) q.delete(k); else q.set(k, v === true ? "1" : v); } router.push(path + (q.toString() ? "?" + q : "")); };
  const chips = [];
  if (f.min || f.max) chips.push(["Price " + (f.min ? "£" + f.min : "£0") + (f.max ? " – £" + f.max : "+"), { min: "", max: "" }]);
  if (f.stock) chips.push(["In stock", { stock: "" }]);
  if (f.sale) chips.push(["On sale", { sale: "" }]);
  const n = chips.length;
  return (
    <>
      <div className="toolbar">
        <button className="tb-btn" onClick={() => setOpen(true)} aria-haspopup="dialog"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>Filters{n > 0 && <b>{n}</b>}</button>
        <div className="tb-chips">{chips.map(([l, patch]) => <button key={l} className="chip-x" onClick={() => go(patch)} aria-label={"Remove filter " + l}>{l} ✕</button>)}</div>
        <span className="tb-count">{count} product{count === 1 ? "" : "s"}</span>
        <label className="tb-sort"><span>Sort</span><select value={sp.get("sort") || ""} onChange={(e) => go({ sort: e.target.value })}><option value="">Featured</option><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
      </div>
      {open && (
        <div className="drawer-bg" onClick={() => setOpen(false)}>
          <aside className="drawer" role="dialog" aria-label="Filters" onClick={(e) => e.stopPropagation()}>
            <header><h2>Filters</h2><button onClick={() => setOpen(false)} aria-label="Close filters" autoFocus>✕</button></header>
            <div className="dbody">
              <h3>Price</h3>
              <div className="ranges">{RANGES.map(([l, a, b]) => <button key={l} className={f.min === a && f.max === b ? "on" : ""} onClick={() => setF({ ...f, min: a, max: b })}>{l}</button>)}</div>
              <div className="mm"><label>Min £<input inputMode="decimal" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} placeholder="0" /></label><label>Max £<input inputMode="decimal" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} placeholder="Any" /></label></div>
              <h3>Availability</h3>
              <label className="sw"><input type="checkbox" checked={f.stock} onChange={(e) => setF({ ...f, stock: e.target.checked })} /> In stock only</label>
              <h3>Offers</h3>
              <label className="sw"><input type="checkbox" checked={f.sale} onChange={(e) => setF({ ...f, sale: e.target.checked })} /> On sale</label>
            </div>
            <footer><button className="btn ghost" onClick={() => { go({ min: "", max: "", stock: "", sale: "" }); setOpen(false); }}>Clear all</button><button className="btn" onClick={() => { go({ min: f.min, max: f.max, stock: f.stock, sale: f.sale }); setOpen(false); }}>Show results</button></footer>
          </aside>
        </div>)}
    </>
  );
}
