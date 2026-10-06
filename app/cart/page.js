"use client";
import { useEffect, useRef, useState } from "react";
import { useCart, write } from "@/components/cart";
import { gbp } from "@/lib/db-format";
export default function Cart() {
  const cart = useCart();
  const [err, setErr] = useState(""), [cfg, setCfg] = useState(null), [codeIn, setCodeIn] = useState(""), [disc, setDisc] = useState(null), [email, setEmail] = useState(""), [busy, setBusy] = useState(false);
  const box = useRef(null);
  const st = useRef({}); st.current = { cart, disc, email };
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const off = disc ? Math.round((sub * disc.percent) / 100) : 0;
  const body = () => JSON.stringify({ items: st.current.cart.map((i) => ({ handle: i.handle, variantId: i.variantId, qty: i.qty })), code: st.current.disc?.code, email: st.current.email });
  useEffect(() => { fetch("/api/config").then((r) => r.json()).then(setCfg); }, []);
  useEffect(() => {
    if (!cfg?.paypal || !cart.length || box.current?.dataset.ready) return;
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${cfg.paypal}&currency=GBP&intent=capture`;
    s.onload = () => {
      if (!box.current) return; box.current.dataset.ready = "1";
      window.paypal.Buttons({
        style: { layout: "vertical", label: "paypal" },
        createOrder: async () => { const j = await (await fetch("/api/paypal/create", { method: "POST", body: body() })).json(); if (!j.id) { setErr(j.error || "Could not start checkout"); throw new Error(j.error); } setErr(""); return j.id; },
        onShippingAddressChange: (d, a) => { const x = d.shippingAddress || {}; if (x.countryCode !== "GB" || /^BT/i.test(x.postalCode || "")) return a.reject(d.errors?.COUNTRY_ERROR); },
        onApprove: async (d) => { const j = await (await fetch("/api/paypal/capture", { method: "POST", body: JSON.stringify({ orderID: d.orderID }) })).json(); if (j.ok) { write([]); location.href = "/thanks"; } else setErr(j.error || "Payment could not be completed. You have not been charged."); },
        onError: () => setErr("Something went wrong with PayPal. Please try again."),
      }).render(box.current);
    };
    document.body.appendChild(s);
  }, [cfg, cart.length]);
  async function apply() {
    setErr("");
    const r = await fetch("/api/discount", { method: "POST", body: JSON.stringify({ ...JSON.parse(body()), code: codeIn.trim() }) });
    const j = await r.json();
    if (r.ok) setDisc(j); else { setDisc(null); setErr(j.error); }
  }
  async function card() {
    setErr(""); setBusy(true);
    const r = await fetch("/api/stripe/create", { method: "POST", body: body() }); const j = await r.json();
    setBusy(false);
    if (j.url) location.href = j.url; else setErr(j.error || "Card checkout is unavailable");
  }
  if (!cart.length) return <><h1>Your basket is empty</h1><p><a href="/">Browse products</a></p></>;
  const setQty = (k, d) => write(cart.map((i) => (i.key === k ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  return (
    <>
      <h1>Your basket</h1>
      {cart.map((i) => (
        <div className="row" key={i.key}>
          <img src={i.image} alt="" />
          <div className="grow"><a href={"/products/" + i.handle}>{i.title}</a>{i.variant && <><br /><small>{i.variant}</small></>}<br />{gbp(i.price)}</div>
          <button onClick={() => setQty(i.key, -1)} aria-label="Remove one">−</button> {i.qty}
          <button onClick={() => setQty(i.key, 1)} aria-label="Add one">+</button>
        </div>
      ))}
      <div className="codebox">
        <input value={codeIn} onChange={(e) => setCodeIn(e.target.value)} placeholder="Discount code" aria-label="Discount code" />
        <button onClick={apply}>Apply</button>
      </div>
      {disc?.firstOnly && <div className="codebox"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (needed for first-order code)" aria-label="Email" /></div>}
      <p>Subtotal {gbp(sub)}{disc && <><br /><span className="save" style={{ marginLeft: 0 }}>{disc.code}: −{gbp(off)}</span></>}<br />Delivery: Free (Great Britain only)<br /><strong>Total {gbp(sub - off)}</strong></p>
      {err && <p role="alert"><strong>{err}</strong></p>}
      <div className="pay">
        {cfg?.paypal && <div ref={box} />}
        {cfg?.stripe && <button className="btn alt" onClick={card} disabled={busy}>{busy ? "Please wait…" : "Pay by card (Stripe)"}</button>}
        {cfg && !cfg.paypal && !cfg.stripe && <p>Checkout is not configured yet.</p>}
      </div>
    </>
  );
}
