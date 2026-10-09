"use client";
export default function Img({ src, fallback, alt = "", ...r }) {
  return <img src={src} alt={alt} onError={(e) => { if (fallback && !e.currentTarget.dataset.f) { e.currentTarget.dataset.f = 1; e.currentTarget.src = fallback; } }} {...r} />;
}
