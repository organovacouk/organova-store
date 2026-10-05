import { env } from "@/lib/db";
export async function GET(_req, { params }) {
  const { key } = await params;
  const { value, metadata } = await env().IMAGES.getWithMetadata(key, "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });
  return new Response(value, { headers: { "content-type": metadata?.type || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" } });
}
