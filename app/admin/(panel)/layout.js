import "./admin.css";
import { redirect } from "next/navigation";
import { adminOk } from "@/lib/admin";
import { db } from "@/lib/db";
import Nav from "@/components/admin/Nav";
export const dynamic = "force-dynamic";
export const metadata = { title: { absolute: "Organova admin" }, robots: { index: false } };
export default async function Panel({ children }) {
  if (!(await adminOk())) redirect("/admin/login");
  const d = db();
  const todo = (await d.prepare("SELECT COUNT(*) n FROM orders WHERE status='paid' AND fulfilment IN ('new','ordered')").first()).n;
  const rv = (await d.prepare("SELECT COUNT(*) n FROM reviews WHERE approved=0").first()).n;
  const ms = (await d.prepare("SELECT COUNT(*) n FROM messages WHERE handled=0").first()).n;
  const items = [["/admin", "Dashboard"], ["/admin/orders", "Orders", todo], ["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/discounts", "Discounts"], ["/admin/customers", "Customers"], ["/admin/reviews", "Reviews", rv], ["/admin/messages", "Messages", ms], ["/admin/journal", "Journal"], ["/admin/settings", "Settings"]];
  return (
    <div className="adm">
      <aside className="side"><a href="/admin" className="brand"><img src="/logo.svg" alt="Organova" /></a><Nav items={items} /><div className="sp" /><a href="/" target="_blank">View store ↗</a>
        <form method="post" action="/api/admin/logout"><button>Sign out</button></form></aside>
      <main>{children}</main>
    </div>
  );
}
