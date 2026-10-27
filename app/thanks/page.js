"use client";
import { useEffect, useState } from "react";
import { write } from "@/components/cart";
export default function Thanks() {
  const [st, setSt] = useState("ok");
  useEffect(() => {
    write([]);
    const id = new URLSearchParams(location.search).get("session_id");
    if (id) fetch("/api/stripe/confirm", { method: "POST", body: JSON.stringify({ session_id: id }) }).then((r) => r.json()).then((j) => { if (!j.ok) setSt("check"); }).catch(() => setSt("check"));
  }, []);
  return (<><h1>Thank you for your order</h1><p>You will receive a receipt and confirmation by email. We will email tracking details once your order ships.</p>
    {st === "check" && <p role="status">If you do not receive a confirmation email within a few minutes, please <a href="/pages/contact">contact us</a> and we will check your order straight away.</p>}
    <p><a href="/track">Track your order</a> · <a href="/">Keep shopping</a></p></>);
}
