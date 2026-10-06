const r = (source, destination) => ({ source, destination, permanent: true });
export default {
  async redirects() {
    return [
      r("/policies/contact-information", "/pages/contact"),
      r("/pages/shipping-and-returns", "/policies/shipping-policy"),
      r("/pages/track-my-order", "/pages/contact"),
      r("/blogs/news", "/blog"), r("/blogs/:path*", "/blog"),
      r("/collections", "/shop"), r("/collections/all", "/shop"),
      r("/collections/kitchen", "/shop?type=Kitchen"), r("/collections/kitchen-organizer", "/shop?type=Kitchen"),
      r("/collections/bedroom", "/shop?type=Bedroom%20%26%20Wardrobe"),
      r("/collections/bathroom-cabinets-cupboards", "/shop?type=Bathroom"),
      r("/collections/wardrobe-shoe-storage", "/shop?type=Hallway%20%26%20Shoes"),
      r("/collections/bedroom-occasional-display-furniture", "/shop?type=Living%20Room%20%26%20General"),
      r("/collections/on-sale", "/shop?sale=1"), r("/collections/home-organizer", "/shop"),
      r("/collections/:path*", "/shop"),
    ];
  },
};
