const LABEL = { processing: "Being prepared", shipped: "On its way", delivered: "Delivered", cancelled: "Cancelled" };
export default function TrackView({ v }) {
  return (
    <div className="tv">
      <div className="tv-h"><h2>Order {v.number}</h2><span className={"tv-s " + v.state}>{LABEL[v.state]}</span></div>
      {v.state === "cancelled" ? <p className="tv-note">{v.refunded ? "This order has been refunded." : "This order was cancelled."} If you did not expect this, please <a href="/pages/contact">contact us</a>.</p> : (<>
        <ol className="tv-steps">{v.steps.map((s) => <li key={s.label} className={s.status}><b>{s.label}</b>{s.date && <small>{s.date}</small>}</li>)}</ol>
        {v.state !== "delivered" && <p className="tv-est">Estimated delivery: <b>{v.estimate.from} to {v.estimate.to}</b></p>}</>)}
      {v.tracking.number && <div className="tv-box"><b>Tracking number</b><br />{v.tracking.number}{v.tracking.url && <><br /><a className="btn sm" href={v.tracking.url}>Track your parcel</a></>}<p><small>Carrier tracking can take a day or two to show movement after dispatch.</small></p></div>}
      <h3>Items in this order</h3><ul>{v.items.map((i, k) => <li key={k}>{i.qty} × {i.title}</li>)}</ul>
      {v.city && <p>Delivering to {v.city}.</p>}
      <p className="tv-help">Need help? <a href="/pages/contact">Contact us</a> and quote {v.number}.</p>
    </div>
  );
}
