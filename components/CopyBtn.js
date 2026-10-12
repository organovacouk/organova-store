"use client";
import { useState } from "react";
export default function CopyBtn({ text, label = "Copy" }) {
  const [ok, setOk] = useState(false);
  return <button type="button" className="btn ghost sm" onClick={() => { navigator.clipboard?.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>{ok ? "Copied" : label}</button>;
}
