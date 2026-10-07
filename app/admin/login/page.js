import "../(panel)/admin.css";
export const metadata = { title: "Admin sign in", robots: { index: false } };
export default async function Login({ searchParams }) {
  const { e } = await searchParams;
  return (
    <div className="adm login"><form method="post" action="/api/admin/login" className="lbox">
      <img src="/logo.svg" alt="Organova" height="48" />
      <h1>Admin sign in</h1>
      {e && <p className="err">{e === "locked" ? "Too many attempts. Try again in an hour." : "That password is not correct."}</p>}
      <label>Password<input name="password" type="password" required autoFocus autoComplete="current-password" /></label>
      <button className="b">Sign in</button>
    </form></div>
  );
}
