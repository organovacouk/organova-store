"use client";
import { useEffect, useState } from "react";
import MiniCard from "./MiniCard";
export default function Recent({ current }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let l = []; try { l = JSON.parse(localStorage.getItem("recent") || "[]"); } catch {}
    if (current) { l = [current, ...l.filter((x) => x !== current)].slice(0, 12); localStorage.setItem("recent", JSON.stringify(l)); }
    const others = l.filter((x) => x !== current).slice(0, 8);
    if (others.length) fetch("/api/products?h=" + others.join(",")).then((r) => r.json()).then(setItems).catch(() => {});
  }, [current]);
  if (!items.length) return null;
  return <section><div className="sh"><h2>Recently viewed</h2></div><div className="rail">{items.map((p) => <MiniCard key={p.handle} p={p} />)}</div></section>;
}
