import { db } from "@/lib/db";
import { authed, challenge } from "@/lib/admin";
export async function POST(req) {
  const a = authed(req); if (a === null) return new Response("Not found", { status: 404 }); if (!a) return challenge();
  const f = await req.formData(); const id = parseInt(f.get("id")); const act = f.get("action");
  if (act === "approve") await db().prepare("UPDATE reviews SET approved=1 WHERE id=?").bind(id).run();
  if (act === "delete") await db().prepare("DELETE FROM reviews WHERE id=?").bind(id).run();
  return new Response(null, { status: 303, headers: { Location: "/admin" } });
}
