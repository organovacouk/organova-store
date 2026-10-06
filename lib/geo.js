export const deliverable = (country, postcode) => country === "GB" && !/^BT/i.test((postcode || "").trim());
