import { db, env } from "@/lib/db";
import { getSetting } from "@/lib/admin";
export default async function Settings({ searchParams }) {
  const { saved } = await searchParams;
  const e = env(); const ship = await getSetting("shipping_pence"); const chatOn = (await getSetting("chat_enabled", "1")) !== "0";
  const val = ship != null ? ship : e.SHIPPING_PENCE || "0";
  const row = (name, ok, hint) => <tr><td>{name}</td><td><span className={"chip " + (ok ? "good" : "warn")}>{ok ? "Connected" : "Not set up"}</span></td><td className="mut">{hint}</td></tr>;
  return (<><div className="top"><h1>Settings</h1></div>{saved && <p className="ok">Saved.</p>}
    <form className="card" method="post" action="/api/admin/do" style={{ maxWidth: 520 }}><h2>Store settings</h2><input type="hidden" name="action" value="settings_save" />
      <label>Standard delivery (£) <span className="h">0 = free. Your shipping policy and FAQ say delivery is free, so update those pages before charging.</span><input name="shipping" defaultValue={(parseInt(val) / 100).toFixed(2)} inputMode="decimal" /></label><label>AI shopping assistant<select name="chat" defaultValue={chatOn ? "1" : "0"}><option value="1">Show on the store</option><option value="0">Hide</option></select></label><button className="b">Save</button></form>
    <div className="card tw"><h2>Connections</h2><table><tbody>
      {row("PayPal checkout", !!e.PAYPAL_CLIENT_ID && !!e.PAYPAL_CLIENT_SECRET, "Mode: " + (e.PAYPAL_ENV || "sandbox") + ". Keys: PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET")}
      {row("Stripe card checkout", !!e.STRIPE_SECRET_KEY, "Key: STRIPE_SECRET_KEY")}
      {row("Stripe webhook", !!e.STRIPE_WEBHOOK_SECRET, "Key: STRIPE_WEBHOOK_SECRET (needed to record card orders)")}
      {row("Email (Resend)", !!e.RESEND_API_KEY, "Key: RESEND_API_KEY. Needed for order emails, shipping emails, sign-in links and contact-form copies")}
      {row("AI assistant", !!(e.AI || e.ANTHROPIC_API_KEY), e.ANTHROPIC_API_KEY ? "Using Claude (ANTHROPIC_API_KEY)" : e.AI ? "Using Cloudflare Workers AI (free allowance)" : "No AI connection found")}
      {row("Admin password", !!e.ADMIN_PASSWORD, "Key: ADMIN_PASSWORD")}</tbody></table>
      <p className="mut">These are set in Cloudflare under Settings → Variables and Secrets. Values are never shown here.</p></div></>);
}
