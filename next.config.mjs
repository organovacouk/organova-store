const r = (source, destination) => ({ source, destination, permanent: true });
export default {
  async redirects() {
    return [
      { source: "/:path*", has: [{ type: "host", value: "www.organova.co.uk" }], destination: "https://organova.co.uk/:path*", permanent: true },
      r("/policies/contact-information", "/pages/contact"), r("/pages/shipping-and-returns", "/policies/shipping-policy"), r("/pages/track-my-order", "/pages/contact"),
      r("/blogs/news", "/blog"), r("/blogs/:path*", "/blog"),
      r("/collections", "/shop"), r("/collections/all", "/shop"), r("/collections/home-organizer", "/shop"),
      r("/collections/:slug/products/:handle", "/products/:handle"),
      r("/collections/kitchen-organizer", "/collections/kitchen"), r("/collections/bathroom-cabinets-cupboards", "/collections/bathroom"),
      r("/collections/wardrobe-shoe-storage", "/collections/hallway-shoes"), r("/collections/bedroom-occasional-display-furniture", "/collections/living-room"), r("/collections/on-sale", "/collections/sale"),
    ];
  },
  async headers() {
    return [{ source: "/:path*", has: [{ type: "host", value: ".*\\.workers\\.dev" }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};
