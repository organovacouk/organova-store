export default function Logo({ height = 40 }) {
  return <img src="/logo.svg" alt="Organova" height={height} style={{ height, width: height * 4.17, display: "block" }} />;
}
