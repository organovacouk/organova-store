export default function robots() { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/cart", "/admin", "/api/", "/search", "/thanks"] }], sitemap: "https://organova.co.uk/sitemap.xml" }; }
