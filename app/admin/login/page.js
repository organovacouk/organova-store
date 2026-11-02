import "../(panel)/admin.css";
import { googleConfigured } from "@/lib/google";
export const metadata = { title: "Admin sign in", robots: { index: false } };
const MSG = { locked: "Too many attempts. Please try again in an hour.", 1: "Those details are not correct.", denied: "That Google account is not on the admin list.", google: "Google sign-in did not complete. Please try again.", nogoogle: "Google sign-in is not switched on yet." };
export default async function Login({ searchParams }) {
  const { e } = await searchParams; const g = googleConfigured();
  return (
    <div className="adm login"><div className="lbox">
      <img src="/logo.svg" alt="Organova" height="48" /><h1>Admin sign in</h1>
      {e && <p className="err">{MSG[e] || MSG[1]}</p>}
      {g && <><a className="b" href="/api/auth/google/start?for=admin" style={{ textAlign: "center" }}>Continue with Google</a><p className="mut" style={{ textAlign: "center", margin: 0 }}>or</p></>}
      <form method="post" action="/api/admin/login" style={{ display: "grid", gap: 12 }}>
        <label>Admin email<input name="email" type="email" autoComplete="username" placeholder="Leave blank to use the shared password" /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        <button className="b">Sign in</button></form>
    </div></div>
  );
}
