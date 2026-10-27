import { deliveryWindow } from "@/lib/track";
export default async function Delivery({ searchParams }) {
  const { saved } = await searchParams; const w = await deliveryWindow();
  return (<><div className="top"><h1>Delivery &amp; tracking</h1></div>{saved && <p className="ok">Saved.</p>}
    <form className="card" method="post" action="/api/admin/delivery" style={{ maxWidth: 560 }}><h2>Delivery estimate</h2>
      <p className="mut">Shown to customers on the order tracking page and in shipping emails. Use the real time AliExpress parcels take to reach the UK, so customers are never misled.</p>
      <div className="row2"><label>Fastest (working days after dispatch)<input name="delivery_min" type="number" min="0" max="60" defaultValue={w.min} /></label><label>Slowest (working days after dispatch)<input name="delivery_max" type="number" min="0" max="60" defaultValue={w.max} /></label></div>
      <label>Flag an order as late if it has no tracking after (days)<input name="late_after_days" type="number" min="1" max="30" defaultValue={w.late} /></label><button className="b">Save</button></form>
    <div className="card" style={{ maxWidth: 560 }}><h2>Keep your policies in step</h2><p>Your shipping policy and FAQ still say delivery takes 3 to 7 days after dispatch. If your real range is {w.min} to {w.max} working days, update those pages. UK consumer law expects delivery claims to be accurate, and payment providers check this when customers dispute an order.</p></div></>);
}
