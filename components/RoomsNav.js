"use client";
import { usePathname, useSearchParams } from "next/navigation";
export default function RoomsNav({ items }) {
  const p = usePathname() || ""; const sp = useSearchParams();
  const type = sp.get("type"), sale = sp.get("sale");
  let active = null;
  if (p.startsWith("/blog")) active = "journal";
  else if (p === "/shop") active = sale ? "sale" : type ? "t:" + type : "all";
  return (
    <nav className="wrap rooms-nav" aria-label="Shop by room">
      {items.map((it) => <a key={it.key} href={it.href} className={it.cls || ""} aria-current={active === it.key ? "page" : undefined}>{it.label}</a>)}
    </nav>
  );
}
