import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PostEditor from "@/components/admin/PostEditor";
export default async function EditPost({ params, searchParams }) {
  const { id } = await params; const { saved } = await searchParams;
  let init = { id: null, title: "", slug: "", excerpt: "", body: "", image_url: "", published_at: new Date().toISOString().slice(0, 10), published: 1 };
  if (id !== "new") { const p = await db().prepare("SELECT * FROM posts WHERE id=?").bind(parseInt(id) || 0).first(); if (!p) notFound(); init = { ...p, image_url: p.image_url || "" }; }
  return (<><div className="top"><div><a href="/admin/journal" className="mut">← Journal</a><h1>{init.id ? "Edit article" : "New article"}</h1></div></div>{saved && <p className="ok">Saved.</p>}<PostEditor init={init} /></>);
}
