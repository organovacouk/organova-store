import { db } from "@/lib/db";
import { rand } from "@/lib/account";
import { notify } from "@/lib/notify";
export async function POST(req) {
  const j = await req.json();
  if (j.website_hp) return Response.json({ ok: true });
  const name = String(j.name || "").trim().slice(0, 80), email = String(j.email || "").trim().toLowerCase().slice(0, 200), site = String(j.website || "").trim().slice(0, 300), promo = String(j.promo || "").trim().slice(0, 1500), pay = String(j.payout_email || "").trim().slice(0, 200);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || !/^\S+@\S+\.\S+$/.test(pay) || !site || promo.length < 20) return Response.json({ error: "Please complete every field. Tell us a little more about how you will share Organova (at least a sentence or two)." }, { status: 400 });
  if (!j.terms) return Response.json({ error: "Please tick the box to accept the partner terms." }, { status: 400 });
  const d = db();
  if ((await d.prepare("SELECT COUNT(*) n FROM affiliates WHERE created_at > datetime('now','-1 hour')").first()).n >= 20) return Response.json({ error: "Too many applications right now. Please try again later." }, { status: 429 });
  if (await d.prepare("SELECT 1 x FROM affiliates WHERE email=?").bind(email).first()) return Response.json({ error: "We already have an application for that email. We will be in touch soon." }, { status: 400 });
  const base = (name.split(/\s+/)[0].toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) || "PARTNER");
  let code = base; for (let n = 10; await d.prepare("SELECT 1 x FROM affiliates WHERE code=?1 UNION SELECT 1 FROM discounts WHERE UPPER(code)=?1").bind(code).first(); n++) code = base + n;
  await d.prepare("INSERT INTO affiliates (code,name,email,status,payout_email,website,promo,token) VALUES (?,?,?,'pending',?,?,?,?)").bind(code, name, email, pay, site, promo, rand(24)).run();
  await notify("New Organova partner application: " + name, `${name} (${email}) applied to the partner programme.\nWebsite/social: ${site}\n\nReview it in the admin under Affiliates.`);
  return Response.json({ ok: true });
}
