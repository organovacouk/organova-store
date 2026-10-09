import "./globals.css";
import Logo from "@/components/Logo";
import Chrome from "@/components/Chrome";
import SearchBox from "@/components/SearchBox";
import { WishLink } from "@/components/Wish";
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
      <Chrome top={<><div className="bar">20% off your first order with code <b>ORGANOVAFIRST</b> · Free UK delivery</div>
      <header><div className="wrap hd">
        <a href="/" aria-label="Organova home"><Logo height={60} /></a>
        <SearchBox />
        <a className="acct" href="/account" aria-label="Your account"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></a>
        <WishLink />
        <CartLink />
      </div>
      <nav className="wrap rooms-nav" aria-label="Shop by room">
        <a href="/shop">Shop all</a>{nav.map(([l, t]) => <a key={t} href={"/shop?type=" + encodeURIComponent(t)}>{l}</a>)}<a href="/shop?sale=1" className="hot">Sale</a><a href="/blog">Journal</a>
      </nav></header>
      </>} bottom={<footer>
        <div className="wrap">
          <div className="f-top">
            <div><h3>Join the Organova list</h3><p>Get 20% off your first order with code ORGANOVAFIRST, plus new arrivals and practical tips.</p></div>
            <Newsletter />
          </div>
          <div className="fg">
            <div className="f-brand"><Logo height={56} /><p>Smart, practical solutions designed to simplify modern British homes.</p>
              <div className="soc" aria-label="Social media">
                <a href="https://www.instagram.com/organova.co.uk" aria-label="Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/></svg></a>
                <a href="https://www.facebook.com/organova.co.uk" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/></svg></a>
                <a href="https://www.pinterest.com/organovacouk" aria-label="Pinterest"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M10.5 16.5 13 8.5c.3-1 1.7-1 2 .1.4 1.5-.5 3.4-2 3.4-.9 0-1.4-.7-1.2-1.5"/></svg></a>
                <a href="https://www.youtube.com/@Organovacouk" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9.5 5 2.5-5 2.5z" fill="currentColor"/></svg></a>
              </div></div>
            <div><h4>Shop</h4>{nav.map(([l, t]) => <a key={t} href={"/shop?type=" + encodeURIComponent(t)}>{l}</a>)}<a href="/shop?sale=1">Sale</a></div>
            <div><h4>Help</h4><a href="/pages/faq">FAQ</a><a href="/pages/contact">Contact us</a><a href="/account">Your orders</a><a href="/policies/shipping-policy">Shipping</a><a href="/policies/refund-policy">Returns &amp; refunds</a></div>
            <div><h4>Organova</h4><a href="/pages/about-us">Why Organova</a><a href="/blog">Journal</a><a href="/policies/privacy-policy">Privacy policy</a><a href="/policies/terms-of-service">Terms of service</a><a href="/policies/legal-notice">Legal notice</a></div>
          </div>
          <div className="f-bot">
            <span>© {new Date().getFullYear()} Organova. All rights reserved.</span>
            <span className="chips"><b>Secure checkout</b><i>PayPal</i><i>Visa</i><i>Mastercard</i><i>Apple Pay</i><i>Google Pay</i></span>
          </div>
        </div>
      </footer>}>{children}</Chrome>
    </body></html>
  );
}
