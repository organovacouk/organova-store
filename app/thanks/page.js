"use client";
import { useEffect } from "react";
import { write } from "@/components/cart";
export default function Thanks() {
  useEffect(() => write([]), []);
  return <><h1>Thank you for your order</h1><p>You will receive a receipt by email. We will send tracking details once your order ships.</p><p><a href="/">Keep shopping</a></p></>;
}
