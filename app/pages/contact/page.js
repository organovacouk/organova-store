import { md } from "@/lib/md";
import { CONTACT } from "@/lib/policies";
import ContactForm from "@/components/ContactForm";
export const metadata = { title: "Contact us — Organova" };
export default function Contact() {
  return <article className="doc"><div dangerouslySetInnerHTML={{ __html: md(CONTACT) }} /><h2>Send us a message</h2><ContactForm /></article>;
}
