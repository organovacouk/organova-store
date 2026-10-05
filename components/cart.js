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
  return <a href="/cart">Basket ({n})</a>;
}
export function AddToCart({ item }) {
  const [done, setDone] = useState(false);
  return (
    <button className="btn" onClick={() => {
      const c = read(); const f = c.find((i) => i.handle === item.handle);
      f ? f.qty++ : c.push({ ...item, qty: 1 });
      write(c); setDone(true); setTimeout(() => setDone(false), 1500);
    }}>{done ? "Added to basket" : "Add to basket"}</button>
  );
}
