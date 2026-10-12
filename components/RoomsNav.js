"use client";
import { usePathname } from "next/navigation";
import { bySlug } from "@/lib/cats";
export default function RoomsNav({ items }) {
  const p = usePathname() || "";
  let active = null;
  if (p.startsWith("/blog")) active = "journal";
  else if (p === "/shop") active = "all";
  else if (p.startsWith("/collections/")) { const c = bySlug(p.split("/")[2]); active = c ? (c.sale ? "sale" : "t:" + c.type) : null; }
  return (
    <nav className="wrap rooms-nav" aria-label="Shop by room">
      {items.map((it) => <a key={it.key} href={it.href} className={it.cls || ""} aria-current={active === it.key ? "page" : undefined}>{it.label}</a>)}
    </nav>
  );
}
