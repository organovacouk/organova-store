import { env } from "@/lib/db";
import { guard } from "@/lib/admin";
import { rand } from "@/lib/account";
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const file = (await req.formData()).get("file");
  if (!file || typeof file === "string") return Response.json({ error: "No file" }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ error: "Only image files are allowed" }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return Response.json({ error: "Image is over 6 MB. Please shrink it first." }, { status: 400 });
  const key = "u" + rand(6);
  await env().IMAGES.put(key, await file.arrayBuffer(), { metadata: { type: file.type } });
  return Response.json({ url: "/img/" + key });
}
