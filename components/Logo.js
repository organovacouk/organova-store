export default function Logo({ size = 28 }) {
  return (
    <span className="logo" aria-label="Organova">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M2 16h28M16 2v28" stroke="currentColor" strokeWidth="2.5" />
        <rect x="19" y="19" width="8" height="8" rx="2" fill="var(--accent)" />
      </svg>
      <span>organova</span>
    </span>
  );
}
