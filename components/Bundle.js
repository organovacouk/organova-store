"use client";
import { useState } from "react";
import { read, write } from "./cart";
const m = (p) => "£" + (p / 100).toFixed(2);
export default function Bundle({ items }) {
  const [on, setOn] = useState(items.map(() => true));
  const [done, setDone] = useState(false);
  const sel = items.filter((_, k) => on[k]);
  const total = sel.reduce((s, i) => s + i.price, 0);
  const add = () => {
    const c = read();
    for (const it of sel) { const key = it.handle + "|0"; const f = c.find((x) => x.key === key); f ? f.qty++ : c.push({ key, handle: it.handle, variantId: null, title: it.title, variant: "", price: it.price, image: it.image, qty: 1 }); }
    write(c); setDone(true); setTimeout(() => setDone(false), 1800);
  };
  return (
    <section className="bundle"><h2>Complete the set</h2>
      <div className="bl">
        {items.map((it, k) => (
          <label key={it.handle} className={on[k] ? "on" : ""}>
            <input type="checkbox" checked={on[k]} onChange={() => setOn(on.map((v, j) => (j === k ? !v : v)))} />
            <img src={it.image} alt="" /><span>{it.title}</span><b>{m(it.price)}</b>
          </label>
        ))}
      </div>
      <div className="bt"><span>Total for {sel.length} item{sel.length === 1 ? "" : "s"}: <b>{m(total)}</b></span><button className="btn" onClick={add} disabled={!sel.length}>{done ? "Added to basket" : "Add selected to basket"}</button></div>
    </section>
  );
}
