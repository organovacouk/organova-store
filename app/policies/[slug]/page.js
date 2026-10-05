import { notFound } from "next/navigation";
import { md } from "@/lib/md";
import { POLICIES } from "@/lib/policies";
export async function generateMetadata({ params }) { const { slug } = await params; return { title: slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) + " — Organova" }; }
export default async function Policy({ params }) {
  const { slug } = await params;
  const text = POLICIES[slug];
  if (!text) notFound();
  return <article className="doc" dangerouslySetInnerHTML={{ __html: md(text) }} />;
}
