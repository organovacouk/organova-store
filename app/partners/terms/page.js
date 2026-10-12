import { md } from "@/lib/md";
import terms from "@/content/partner-terms";
export const metadata = { title: "Partner programme terms" };
export default function Terms() { return <article className="doc" dangerouslySetInnerHTML={{ __html: md(terms) }} />; }
