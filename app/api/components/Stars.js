export default function Stars({ v = 0, n }) {
  return <span className="rate" aria-label={`${(+v).toFixed(1)} out of 5`}><span className="stars" style={{ "--p": (v / 5) * 100 + "%" }}>★★★★★</span>{n != null && <small> ({n})</small>}</span>;
}
