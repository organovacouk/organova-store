import { getRules } from "@/lib/pricing";
import PricingForm from "@/components/admin/PricingForm";
export default async function Pricing({ searchParams }) {
  const { saved } = await searchParams; const rules = await getRules();
  return (<><div className="top"><h1>Pricing rules</h1></div>{saved && <p className="ok">Saved. The product editor now uses these rules.</p>}
    <p className="mut" style={{ maxWidth: 680 }}>These rules turn a supplier cost into a selling price that gives you the profit you want after payment fees and refunds. They power the profit readout and the "Suggested price" button on every product.</p>
    <PricingForm init={rules} /></>);
}
