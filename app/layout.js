import "./globals.css";
import { CartLink } from "@/components/cart";
export const metadata = { title: "Organova — Home organisation", description: "Storage and organisation for every room in the home." };
export default function Root({ children }) {
  return (
    <html lang="en-GB"><body>
      <header><div className="wrap"><a className="logo" href="/">Organova</a><CartLink /></div></header>
      <main className="wrap">{children}</main>
      <footer><div className="wrap">© Organova · organova.co.uk</div></footer>
    </body></html>
  );
}
