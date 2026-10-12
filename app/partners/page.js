import ApplyForm from "@/components/ApplyForm";
export const metadata = { title: "Become an Organova partner", description: "Earn 10% commission recommending smart home storage. Free to join, a personal discount code for your audience, and a simple dashboard to track every sale." };
export default function Partners() {
  return (
    <>
      <section className="hero-p"><p className="eyebrow">Organova partners</p><h1>Share what you love. Get paid when it sells.</h1>
        <p className="lead">Recommend practical home storage to your followers or readers. You earn <b>10% commission</b> on every order, and your audience gets <b>10% off</b>. It's free to join.</p>
        <a className="btn" href="#apply">Apply to join</a></section>
      <section><h2>How it works</h2>
        <div className="steps"><div><b>1</b><h3>Apply</h3><p>Tell us where you share. We review every application within a few working days.</p></div>
          <div><b>2</b><h3>Get your link and code</h3><p>Once approved you get a personal link and a discount code, plus a private dashboard.</p></div>
          <div><b>3</b><h3>Share</h3><p>Post your link or code. Anyone who buys through it is tracked to you for 30 days.</p></div>
          <div><b>4</b><h3>Get paid</h3><p>Commission is confirmed after the 14-day cancellation window and paid by PayPal once you reach £25.</p></div></div></section>
      <section><h2>The details</h2>
        <ul className="doc" style={{ padding: "0 0 0 20px" }}>
          <li><b>10% commission</b> on the order value after discounts, excluding delivery.</li>
          <li><b>10% off</b> for your audience with your personal code, or automatically when they arrive through your link.</li>
          <li><b>30-day tracking</b> from the click, where the visitor allows our partner cookie. Your code works even without it.</li>
          <li><b>Live dashboard</b> showing clicks, orders and what you are owed.</li>
          <li><b>Paid monthly</b> by PayPal, with a £25 minimum balance.</li>
          <li><b>Honest promotion only.</b> Always label posts as ad or affiliate, as UK advertising rules require. Orders that are cancelled or refunded don't earn commission.</li></ul></section>
      <section id="apply" className="doc"><h2>Apply to join</h2><ApplyForm /></section>
    </>
  );
}
