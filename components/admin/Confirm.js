"use client";
export default function Confirm({ children, msg = "Are you sure?", className = "b r sm" }) {
  return <button className={className} onClick={(e) => { if (!confirm(msg)) e.preventDefault(); }}>{children}</button>;
}
