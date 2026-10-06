import "./globals.css";
import Logo from "@/components/Logo";
import { CartLink } from "@/components/cart";
export const metadata = { title: "Organova — Storage for every room", description: "Smart storage and organisation for the kitchen, bathroom, bedroom, hallway and more." };
export default function Root({ children }) {
  return (
    <html lang="en-GB"><head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=Figtree:wght@400;600&display=swap" rel="stylesheet" />
    </head><body>
      <div className="bar">20% off your first order with code ORGANOVAFIRST · Free UK delivery</div>
      <header><div className="wrap">
        <a href="/" style={{ textDecoration: "none" }}><Logo /></a>
        <nav className="main"><a href="/?type=Kitchen">Kitchen</a><a href="/?type=Bathroom">Bathroom</a><a href="/?type=Bedroom%20%26%20Wardrobe">Bedroom</a><a href="/?type=Hallway%20%26%20Shoes">Hallway</a><a href="/?type=Living%20Room%20%26%20General">Living room</a></nav>
        <CartLink />
      </div></header>
      <main className="wrap">{children}</main>
      <footer><div className="wrap"><Logo height={30} />
        <span className="foot"><a href="/pages/contact">Contact</a><a href="/policies/shipping-policy">Shipping</a><a href="/policies/refund-policy">Returns &amp; refunds</a><a href="/policies/privacy-policy">Privacy</a><a href="/policies/terms-of-service">Terms</a><a href="/policies/legal-notice">Legal notice</a></span>
        <span>© Organova</span></div></footer>
    </body></html>
  );
}
