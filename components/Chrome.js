"use client";
import { usePathname } from "next/navigation";
import Chat from "./Chat";
export default function Chrome({ top, bottom, children }) {
  const p = usePathname() || "";
  if (p.startsWith("/admin")) return <>{children}</>;
  return <>{top}<main id="main" className="wrap">{children}</main>{bottom}<Chat /></>;
}
