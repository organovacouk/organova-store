"use client";
import { useEffect, useState } from "react";
export const read = () => { try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; } };
export const write = (c) => { localStorage.setItem("cart", JSON.stringify(c)); window.dispatchEvent(new Event("cart")); };
export function useCart() {
  const [cart, set] = useState([]);
  useEffect(() => { const f = () => set(read()); f(); window.addEventListener("cart", f); return () => window.removeEventListener("cart", f); }, []);
  return cart;
}
export function CartLink() {
  const n = useCart().reduce((s, i) => s + i.qty, 0);
  return <a className="bag" href="/cart" aria-label={`Basket, ${n} items`}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 8h14l-1.2 11H6.2L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>{n > 0 && <b>{n}</b>}</a>;
}
const money = (p) => "£" + (p / 100).toFixed(2);
export function Buy({ product, variants }) {
  const [vid, setVid] = useState(variants[0]?.id);
  const [done, setDone] = useState(false);
  const v = variants.find((x) => x.id === +vid);
  const price = v ? v.price_pence : product.price;
  const was = v ? v.compare_at_pence : product.compare;
  const add = () => {
    const key = product.handle + "|" + (v?.id || 0);
    const c = read(); const f = c.find((i) => i.key === key);
    f ? f.qty++ : c.push({ key, handle: product.handle, variantId: v?.id || null, title: product.title, variant: v?.title || "", price, image: product.image, qty: 1 });
    write(c); setDone(true); setTimeout(() => setDone(false), 1500);
  };
  return (
    <>
      <p><span className="price" style={{ fontSize: 24 }}>{money(price)}</span>{was > price && <><span className="was">{money(was)}</span><span className="save">Save {money(was - price)}</span></>}</p>
      {variants.length > 0 && (<><label className="opt" htmlFor="v">Choose an option</label>
        <select id="v" value={vid} onChange={(e) => setVid(e.target.value)}>
          {variants.map((x) => <option key={x.id} value={x.id}>{x.title} — {money(x.price_pence)}</option>)}
        </select></>)}
      <button className="btn wide" onClick={add} disabled={product.available === 0}>{product.available === 0 ? "Sold out" : done ? "Added to basket" : "Add to basket"}</button>
    </>
  );
}
