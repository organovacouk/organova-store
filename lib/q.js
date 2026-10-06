export const SEL = `SELECT p.*, (SELECT COUNT(*) FROM variants v WHERE v.handle=p.handle) nv, (SELECT MIN(price_pence) FROM variants v WHERE v.handle=p.handle) minp, (SELECT COUNT(*) FROM reviews r WHERE r.handle=p.handle AND r.approved=1) rc, (SELECT AVG(rating) FROM reviews r WHERE r.handle=p.handle AND r.approved=1) ravg FROM products p WHERE p.status='active'`;
export const ROOMS = ["Kitchen", "Bathroom", "Bedroom & Wardrobe", "Hallway & Shoes", "Living Room & General", "Laundry", "Shelving & Garage"];
export const SITE = "https://organova.co.uk";
