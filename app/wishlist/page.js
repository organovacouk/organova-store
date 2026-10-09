"use client";
import { useEffect, useState } from "react";
import MiniCard from "@/components/MiniCard";
import { useWish, removeWish } from "@/components/Wish";
export default function Wishlist() {
  const w = useWish(); const [items, setItems] = useState(null);
  useEffect(() => { if (!w.length) { setItems([]); return; } fetch("/api/products?h=" + w.join(",")).then((r) => r.json()).then(setItems); }, [w.join(",")]);
  return (<><h1 className="ph1" style={{ marginTop: 24 }}>Your wishlist</h1>
    {items && !items.length && <p>Nothing saved yet. Tap the heart on any product to save it for later. <a href="/shop">Browse products</a></p>}
    <div className="grid">{(items || []).filter((p) => w.includes(p.handle)).map((p) => <MiniCard key={p.handle} p={p}><button className="btn ghost sm" style={{ marginTop: 8 }} onClick={() => removeWish(p.handle)}>Remove</button></MiniCard>)}</div></>);
}
