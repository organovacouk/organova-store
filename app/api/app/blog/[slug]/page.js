import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { md } from "@/lib/md";
export const dynamic = "force-dynamic";
const get = (s) => db().prepare("SELECT * FROM posts WHERE slug=? AND published=1").bind(s).first();
export async function generateMetadata({ params }) { const p = await get((await params).slug); return p ? { title: p.title, description: p.excerpt, openGraph: { title: p.title, description: p.excerpt, type: "article" } } : {}; }
export default async function Post({ params }) {
  const p = await get((await params).slug); if (!p) notFound();
  return (<article className="doc"><div className="crumbs"><a href="/">Home</a> / <a href="/blog">Journal</a></div><h1>{p.title}</h1><p className="muted">{p.published_at} · Organova team</p>{p.image_url && <img className="hero-img" src={p.image_url} alt="" />}<div dangerouslySetInnerHTML={{ __html: md(p.body) }} /><p><a className="btn ghost" href="/blog">More articles</a></p></article>);
}
