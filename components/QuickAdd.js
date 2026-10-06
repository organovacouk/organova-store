"use client";
import { useState } from "react";
import { read, write } from "./cart";
export default function QuickAdd({ item }) {
  const [d, setD] = useState(false);
  return <button className="btn sm" onClick={() => { const c = read(); const key = item.handle + "|0"; const f = c.find((x) => x.key === key); f ? f.qty++ : c.push({ key, handle: item.handle, variantId: null, title: item.title, variant: "", price: item.price, image: item.image, qty: 1 }); write(c); setD(true); setTimeout(() => setD(false), 1500); }}>{d ? "Added" : "Add"}</button>;
}
