import { sendMail } from "./mail";
import { itemsOf, orderNo } from "./addr";
import { trackLink, deliveryWindow } from "./track";
const money = (p) => "£" + (p / 100).toFixed(2);
const list = (o) => itemsOf(o.items_json).map((l) => `  ${l.qty} x ${l.title}`).join("\n");
export async function shippedEmail2(o, origin) {
  const w = await deliveryWindow();
  return sendMail({ to: o.email, subject: `Your Organova order ${orderNo(o.id)} has shipped`,
    text: `Good news, your order ${orderNo(o.id)} is on its way.\n\n${list(o)}\n\nTracking number: ${o.tracking_number}${o.tracking_url ? `\nTrack your parcel with the carrier: ${o.tracking_url}` : ""}\n\nYour order status page: ${await trackLink(o, origin)}\n\nParcels usually arrive within ${w.min}-${w.max} working days of dispatch. Tracking can take a day or two to start showing movement.\n\nIf anything is wrong, just reply to this email or write to support@organova.co.uk.\n\nOrganova` });
}
export async function deliveredEmail(o, origin) {
  const hs = [...new Set(itemsOf(o.items_json).map((l) => l.handle).filter(Boolean))].slice(0, 3);
  return sendMail({ to: o.email, subject: `Your Organova order ${orderNo(o.id)} has been delivered`,
    text: `Your order ${orderNo(o.id)} is marked as delivered. We hope you love it.\n\n${hs.length ? `If you have a minute, a review helps other shoppers:\n${hs.map((h) => `  ${origin}/products/${h}#reviews`).join("\n")}\n\n` : ""}If something is not right with your order, please reply to this email or write to support@organova.co.uk and we will sort it out. Your order page: ${await trackLink(o, origin)}\n\nOrganova` });
}
export const refundEmail = (o, amountPence, full) => sendMail({ to: o.email, subject: `Your Organova refund for order ${orderNo(o.id)}`,
  text: `We have ${full ? "fully" : "partly"} refunded your order ${orderNo(o.id)}.\n\nRefund amount: ${money(amountPence)}\n\nIt usually appears on your statement within 5-10 working days, depending on your bank or PayPal.\n\nQuestions? Reply to this email or write to support@organova.co.uk.\n\nOrganova` });
