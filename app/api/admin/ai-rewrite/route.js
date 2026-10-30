import { env } from "@/lib/db";
import { guard } from "@/lib/admin";
const SYSTEM = `You are an ecommerce copywriter for a UK home-organisation store. Rewrite the product title and description in clear, original UK English for shoppers.
Keep ONLY facts present in the supplied text (sizes, materials, quantities, features). Do not invent claims, certifications, awards, discounts, warranties, guarantees or delivery promises. Do not mention AliExpress or any supplier.
Title: at most 70 characters, no ALL CAPS, no emoji, no brand names unless they are in the source.
Description: HTML using only <p>, <ul>, <li> and <strong>: one short intro paragraph, then 4 to 6 bullet points of key features, then (only if the source mentions it) a short "What's in the box" line.
Reply with JSON only, in this exact shape: {"title":"...","description":"..."}`;
const MODELS = ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/meta/llama-3.1-8b-instruct-fast", "@cf/meta/llama-3.1-8b-instruct-fp8"];
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const e = env(); if (!e.AI && !e.ANTHROPIC_API_KEY) return Response.json({ error: "No AI connection is set up." }, { status: 503 });
  const j = await req.json(); const src = `TITLE: ${String(j.title || "").slice(0, 300)}\nDESCRIPTION:\n${String(j.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 3500)}`;
  if (src.length < 40) return Response.json({ error: "Add a title and some description text first." }, { status: 400 });
  let text = "", last = "";
  if (e.ANTHROPIC_API_KEY) {
    try { const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": e.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: e.CHAT_MODEL || "claude-haiku-4-5-20251001", max_tokens: 900, system: SYSTEM, messages: [{ role: "user", content: src }] }) }); text = (await r.json()).content?.[0]?.text || ""; } catch (err) { last = String(err.message || err); }
  } else {
    for (const m of [...new Set([e.REWRITE_MODEL, ...MODELS].filter(Boolean))]) {
      try { const r = await e.AI.run(m, { messages: [{ role: "system", content: SYSTEM }, { role: "user", content: src }], max_tokens: 900 }); text = String(r?.response ?? r?.choices?.[0]?.message?.content ?? ""); if (text) break; } catch (err) { last = `${m}: ${err?.message || err}`; }
    }
  }
  const m = text.match(/\{[\s\S]*\}/); let out = null; try { out = m ? JSON.parse(m[0]) : null; } catch {}
  if (!out?.title || !out?.description) return Response.json({ error: "The AI did not return a usable rewrite. Try again. " + last.slice(0, 120) }, { status: 502 });
  const clean = String(out.description).replace(/<(?!\/?(p|ul|li|strong)\b)[^>]*>/gi, "").slice(0, 4000);
  return Response.json({ title: String(out.title).slice(0, 120), description: clean });
}
