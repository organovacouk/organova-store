import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "Journal", description: "Practical tips and ideas for organising every room of your home." };
export default async function Blog() {
  const posts = (await db().prepare("SELECT slug,title,excerpt,image_url,published_at FROM posts WHERE published=1 ORDER BY published_at DESC").all()).results;
  return (<><div className="crumbs"><a href="/">Home</a> / <span>Journal</span></div><h1 className="ph1">The Organova journal</h1><p className="lead">Practical ideas for a calmer, better-organised home.</p>
    <div className="posts big">{posts.map((p) => <a key={p.slug} className="post" href={"/blog/" + p.slug}>{p.image_url ? <img src={p.image_url} alt="" /> : <div className="ph0" />}<small>{p.published_at}</small><h3>{p.title}</h3><p>{p.excerpt}</p></a>)}</div></>);
}
