import "./globals.css";
import Logo from "@/components/Logo";
import Newsletter from "@/components/Newsletter";
import { CartLink } from "@/components/cart";
export const metadata = {
  metadataBase: new URL("https://organova.co.uk"),
  title: { default: "Organova — Smart storage for every room", template: "%s — Organova" },
  description: "Smart, practical home organisation for British homes. Kitchen, bathroom, bedroom and hallway storage with free UK delivery.",
  openGraph: { siteName: "Organova", type: "website", locale: "en_GB" },
};
const nav = [["Kitchen", "Kitchen"], ["Bathroom", "Bathroom"], ["Bedroom", "Bedroom & Wardrobe"], ["Hallway", "Hallway & Shoes"], ["Living room", "Living Room & General"]];
export default function Root({ children }) {
  return (
    <html lang="en-GB"><head>
      <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet" />
    </head><body>
      <a className="skip" href="#main">Skip to content</a>
      <div className="bar">20% off your first order with code <b>ORGANOVAFIRST</b> · Free UK delivery</div>
      <header><div className="wrap hd">
        <a href="/" aria-label="Organova home"><Logo height={38} /></a>
        <form action="/search" className="search" role="search"><input name="q" placeholder="Search storage, racks, shelves…" aria-label="Search" /><button aria-label="Search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button></form>
        <a className="acct" href="/account" aria-label="Your account"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></a>
        <CartLink />
      </div>
      <nav className="wrap rooms-nav" aria-label="Shop by room">
        <a href="/shop">Shop all</a>{nav.map(([l, t]) => <a key={t} href={"/shop?type=" + encodeURIComponent(t)}>{l}</a>)}<a href="/shop?sale=1" className="hot">Sale</a><a href="/blog">Journal</a>
      </nav></header>
      <main id="main" className="wrap">{children}</main>
      <footer><div className="wrap">
        <div className="fg">
          <div><Logo height={34} /><p>Smart, practical solutions designed to simplify modern British homes.</p>
            <div className="soc"><a href="https://www.instagram.com/organova.co.uk">Instagram</a><a href="https://www.facebook.com/organova.co.uk">Facebook</a><a href="https://www.pinterest.com/organovacouk">Pinterest</a><a href="https://www.youtube.com/@Organovacouk">YouTube</a></div></div>
          <div><h4>Shop</h4>{nav.map(([l, t]) => <a key={t} href={"/shop?type=" + encodeURIComponent(t)}>{l}</a>)}<a href="/shop?sale=1">Sale</a></div>
          <div><h4>Help</h4><a href="/pages/faq">FAQ</a><a href="/pages/contact">Contact us</a><a href="/policies/shipping-policy">Shipping</a><a href="/policies/refund-policy">Returns &amp; refunds</a></div>
          <div><h4>Organova</h4><a href="/pages/about-us">Why Organova</a><a href="/blog">Journal</a><a href="/policies/privacy-policy">Privacy</a><a href="/policies/terms-of-service">Terms</a><a href="/policies/legal-notice">Legal notice</a></div>
          <div><h4>Get 20% off</h4><p>Join the list for new arrivals and tips. Unsubscribe any time.</p><Newsletter /></div>
        </div>
        <p className="fine">© {new Date().getFullYear()} Organova · Secure checkout with PayPal and Stripe</p>
      </div></footer>
    </body></html>
  );
}
