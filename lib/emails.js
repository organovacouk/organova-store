import { sendMail } from "./mail";
import { addrLines, orderNo, itemsOf } from "./addr";
const money = (p) => "£" + (p / 100).toFixed(2);
const list = (o) => itemsOf(o.items_json).map((l) => `  ${l.qty} x ${l.title} (${money(l.price_pence)})`).join("\n");
export const confirmationEmail = (o) => sendMail({ to: o.email, subject: `Your Organova order ${orderNo(o.id)}`,
  text: `Thank you for your order.\n\nOrder ${orderNo(o.id)}\n${list(o)}\n${o.discount_pence ? `Discount (${o.discount_code}): -${money(o.discount_pence)}\n` : ""}Delivery: ${o.shipping_pence ? money(o.shipping_pence) : "Free"}\nTotal paid: ${money(o.total_pence)}\n\nDelivering to:\n  ${addrLines(o.shipping_json).join("\n  ")}\n\nWe will email you tracking details as soon as your order ships (usually within 1-3 business days). Delivery normally takes 3-7 business days after dispatch.\n\nYou can view your orders any time at https://organova.co.uk/account\n\nQuestions? Reply to this email or write to support@organova.co.uk.\n\nOrganova` });
export const shippedEmail = (o) => sendMail({ to: o.email, subject: `Your Organova order ${orderNo(o.id)} has shipped`,
  text: `Good news, your order ${orderNo(o.id)} is on its way.\n\n${list(o)}\n\nTracking number: ${o.tracking_number || "to follow"}${o.tracking_url ? `\nTrack it here: ${o.tracking_url}` : ""}\n\nTracking can take a day or two to start showing movement. Delivery normally takes 3-7 business days.\n\nView your orders any time at https://organova.co.uk/account\n\nQuestions? Reply to this email or write to support@organova.co.uk.\n\nOrganova` });
