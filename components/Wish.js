"use client";
import { useEffect, useState } from "react";
const get = () => { try { return JSON.parse(localStorage.getItem("wish") || "[]"); } catch { return []; } };
const put = (a) => { localStorage.setItem("wish", JSON.stringify(a)); window.dispatchEvent(new Event("wish")); };
export function useWish() { const [w, s] = useState([]); useEffect(() => { const f = () => s(get()); f(); window.addEventListener("wish", f); return () => window.removeEventListener("wish", f); }, []); return w; }
export default function Wish({ handle }) {
  const w = useWish(); const on = w.includes(handle);
  return <button className={"heart" + (on ? " on" : "")} aria-pressed={on} aria-label={on ? "Remove from wishlist" : "Add to wishlist"} onClick={() => put(on ? w.filter((x) => x !== handle) : [handle, ...w])}>♥</button>;
}
export function WishLink() {
  const n = useWish().length;
  return <a className="bag" href="/wishlist" aria-label={`Wishlist, ${n} items`}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>{n > 0 && <b>{n}</b>}</a>;
}
export const removeWish = (h) => put(get().filter((x) => x !== h));
