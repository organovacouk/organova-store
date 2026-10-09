"use client";
import { useState } from "react";
export default function Gallery({ images, alt }) {
  const [i, setI] = useState(0);
  return (
    <div className="gal">
      <div className="main"><img src={images[i]} alt={alt} /></div>
      {images.length > 1 && <div className="thumbs">{images.map((s, k) => <button key={s} onClick={() => setI(k)} aria-label={"Image " + (k + 1)} aria-current={k === i}><img src={s} alt="" /></button>)}</div>}
    </div>
  );
}
