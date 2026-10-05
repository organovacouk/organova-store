import { md } from "@/lib/md";
import { CONTACT } from "@/lib/policies";
export const metadata = { title: "Contact us — Organova" };
export default function Contact() { return <article className="doc" dangerouslySetInnerHTML={{ __html: md(CONTACT) }} />; }
