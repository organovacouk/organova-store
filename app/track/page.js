import "./track.css";
import { db } from "@/lib/db";
import { trackView, trackToken } from "@/lib/track";
import TrackView from "@/components/TrackView";
import TrackForm from "@/components/TrackForm";
export const dynamic = "force-dynamic";
export const metadata = { title: "Track your order", description: "Check the status of your Organova order.", robots: { index: false } };
export default async function Track({ searchParams }) {
  const sp = await searchParams; let view = null, bad = false;
  if (sp.o && sp.k) {
    const id = parseInt(String(sp.o).replace(/[^0-9]/g, "")) - 1000;
    const o = id > 0 ? await db().prepare("SELECT * FROM orders WHERE id=? AND status IN ('paid','refunded')").bind(id).first() : null;
    if (o && (await trackToken(o)) === sp.k) view = await trackView(o); else bad = true;
  }
  return (
    <section className="doc"><h1>Track your order</h1>
      {view ? <TrackView v={view} /> : (<>{bad && <p role="alert"><b>That link is not valid.</b> Enter your order number and email below instead.</p>}<p>Enter your order number (from your confirmation email) and the email address you used.</p><TrackForm /></>)}
    </section>
  );
}
