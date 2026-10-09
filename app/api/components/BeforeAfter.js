"use client";
import { useState } from "react";
export default function BeforeAfter() {
  const [v, setV] = useState(50);
  return (
    <div className="ba">
      <img src="/img/after-kitchen" alt="Organised kitchen" />
      <img src="/img/before-kitchen" alt="Cluttered kitchen" style={{ clipPath: `inset(0 ${100 - v}% 0 0)` }} />
      <span className="lb l">Before</span><span className="lb r">After</span>
      <input type="range" min="0" max="100" value={v} onChange={(e) => setV(+e.target.value)} aria-label="Compare before and after" />
    </div>
  );
}
