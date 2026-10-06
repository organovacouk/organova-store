import { md } from "@/lib/md";
import faq from "@/content/faq";
export const metadata = { title: "FAQ", description: "Answers about orders, delivery, returns, products and payments." };
export default function FAQ() { return <article className="doc" dangerouslySetInnerHTML={{ __html: md(faq) }} />; }
