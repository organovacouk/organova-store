export function addr(json) {
  let a = {}; try { a = JSON.parse(json || "{}"); } catch {}
  return { line1: a.address_line_1 || a.line1 || "", line2: a.address_line_2 || a.line2 || "", city: a.admin_area_2 || a.city || "", county: a.admin_area_1 || a.state || "", postcode: a.postal_code || "", country: a.country_code || a.country || "", phone: a.phone || "" };
}
export const addrLines = (json) => { const a = addr(json); return [a.line1, a.line2, a.city, a.county, a.postcode, a.country].filter(Boolean); };
export const orderNo = (id) => "#" + (1000 + id);
export const itemsOf = (j) => { try { return JSON.parse(j || "[]"); } catch { return []; } };
export const FUL = { new: "Processing", ordered: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
