import { md } from "@/lib/md";
import about from "@/content/about";
export const metadata = { title: "Why Organova", description: "Curated, honest and built for British homes. Learn why Organova exists." };
export default function About() { return <article className="doc" dangerouslySetInnerHTML={{ __html: md(about) }} />; }
