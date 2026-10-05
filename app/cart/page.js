"use client";
import { useEffect, useRef, useState } from "react";
import { useCart, write } from "@/components/cart";
import { gbp } from "@/lib/db-format";
export default function Cart() {
  const cart = useCart();
  const [err, setErr] = useState("");
  const box = useRef(null);
  const ref = useRef(cart); ref.current = cart;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  useEffect(() => {
    if (!cart.length || box.current?.dataset.ready) return;
    (async () => {
      const { clientId } = await (await fetch("/api/config")).json();
      if (!clientId) return setErr("Checkout is not configured yet.");
      const s = document.createElement("script");
      s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=GBP&intent=capture`;
      s.onload = () => {
        box.current.dataset.ready = "1";
        window.paypal.Buttons({
          createOrder: async () => {
            const r = await fetch("/api/paypal/create", { method: "POST", body: JSON.stringify({ items: ref.current.map((i) => ({ handle: i.handle, qty: i.qty })) }) });
            const j = await r.json(); if (!j.id) throw new Error(j.error || "Could not start checkout"); return j.id;
          },
          onApprove: async (d) => {
            const r = await fetch("/api/paypal/capture", { method: "POST", body: JSON.stringify({ orderID: d.orderID }) });
            const j = await r.json();
            if (j.ok) { write([]); location.href = "/thanks"; } else setErr("Payment could not be completed. You have not been charged.");
          },
          onError: () => setErr("Something went wrong with PayPal. Please try again."),
        }).render(box.current);
      };
      document.body.appendChild(s);
    })();
  }, [cart.length]);
  if (!cart.length) return <><h1>Your basket is empty</h1><p><a href="/">Browse products</a></p></>;
  const setQty = (h, d) => write(cart.map((i) => (i.handle === h ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));
  return (
    <>
      <h1>Your basket</h1>
      {cart.map((i) => (
        <div className="row" key={i.handle}>
          <img src={i.image} alt="" />
          <div className="grow"><a href={"/products/" + i.handle}>{i.title}</a><br />{gbp(i.price)}</div>
          <button onClick={() => setQty(i.handle, -1)} aria-label="Remove one">−</button> {i.qty}
          <button onClick={() => setQty(i.handle, 1)} aria-label="Add one">+</button>
        </div>
      ))}
      <p><strong>Subtotal {gbp(total)}</strong> — delivery is added at checkout.</p>
      {err && <p role="alert">{err}</p>}
      <div ref={box} style={{ maxWidth: 420, marginBottom: 48 }} />
    </>
  );
}
