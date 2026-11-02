import { db, env } from "@/lib/db";
import { guard } from "@/lib/admin";
import { hashPassword, checkPassword } from "@/lib/password";
export async function POST(req) {
  const g = await guard(req); if (g) return g;
  const f = await req.formData(); const act = f.get("action"), id = parseInt(f.get("id")) || 0, origin = new URL(req.url).origin, d = db();
  const go = (m, ok) => new Response(null, { status: 303, headers: { Location: `${origin}/admin/team?${ok ? "msg" : "err"}=${encodeURIComponent(m)}` } });
  if (act === "add") {
    const email = String(f.get("email") || "").trim().toLowerCase(), name = String(f.get("name") || "").trim().slice(0, 80) || null, pw = String(f.get("password") || "");
    if (!/^\S+@\S+\.\S+$/.test(email)) return go("Please enter a valid email address.");
    if (await d.prepare("SELECT 1 x FROM admins WHERE email=?").bind(email).first()) return go("That person is already an admin.");
    let h = { hash: null, salt: null }; if (pw) { const why = await checkPassword(pw, email); if (why) return go(why); h = await hashPassword(pw); }
    await d.prepare("INSERT INTO admins (email,name,password_hash,password_salt) VALUES (?,?,?,?)").bind(email, name, h.hash, h.salt).run();
    return go(`${email} can now sign in with Google${pw ? " or their password" : ""}.`, true);
  }
  if (act === "setpw") {
    const a = await d.prepare("SELECT * FROM admins WHERE id=?").bind(id).first(); if (!a) return go("Admin not found.");
    const pw = String(f.get("password") || ""); const why = await checkPassword(pw, a.email); if (why) return go(why);
    const h = await hashPassword(pw); await d.prepare("UPDATE admins SET password_hash=?, password_salt=? WHERE id=?").bind(h.hash, h.salt, id).run();
    return go(`Password updated for ${a.email}.`, true);
  }
  if (act === "remove") {
    const n = (await d.prepare("SELECT COUNT(*) n FROM admins").first()).n;
    if (n <= 1 && !env().ADMIN_PASSWORD) return go("You cannot remove the last admin while there is no shared admin password.");
    await d.prepare("DELETE FROM admins WHERE id=?").bind(id).run(); return go("Admin removed.", true);
  }
  return go("Nothing to do.");
}
