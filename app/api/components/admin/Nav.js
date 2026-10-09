"use client";
import { usePathname } from "next/navigation";
export default function Nav({ items }) {
  const p = usePathname();
  return items.map(([href, label, n]) => { const on = href === "/admin" ? p === "/admin" : p.startsWith(href); return <a key={href} href={href} className={on ? "on" : ""}>{label}{n > 0 && <span className="n">{n}</span>}</a>; });
}
