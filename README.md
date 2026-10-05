# Organova store (Next.js on Cloudflare Workers + D1 + PayPal)

Cloudflare build settings (Workers & Pages -> Create -> Import a repository):
- Build command: npx opennextjs-cloudflare build
- Deploy command: npx opennextjs-cloudflare deploy
Then add secrets PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET under Settings -> Variables and Secrets.
PAYPAL_ENV is "sandbox" in wrangler.jsonc; change it to "live" only when going live.
Delivery charge: SHIPPING_PENCE in wrangler.jsonc (0 = free).
