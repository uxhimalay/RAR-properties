import { AGENCY_SERVICES, AGENCY_SERVICES_SECTION, CONTACT, DEALS, DEALS_SECTION, DEALS_SIZES, DEALS_VISIT, HERO, PROJECT_MARQUEE, PROJECT_MARQUEE_SECTION, PROJECT_TABS_SECTION, SCATTER_SECTION, SITE_FOOTER, STATS_TICKER } from "@/lib/content";
import type { MediaItem, Property, SiteContent } from "@/lib/cms/schema";

/* ------------------------------------------------------------------------------------------------
 * The first content document: today's hard-coded copy and photos, plus a set of Dubai property
 * listings with plausible 2026 numbers (proxies until the agency loads its own) and the developer
 * partners for the ribbon. `readContent()` writes this to data/site.json the first time it runs.
 * ---------------------------------------------------------------------------------------------- */

const NOW = "2026-09-20T00:00:00.000Z";

const SEED_IMAGES: { src: string; alt: string }[] = [
  { src: "/images/hero-dubai-balcony.jpg", alt: "Balcony over Dubai Marina at dusk" },
  { src: "/images/hero-side-bedroom.jpg", alt: "Bedroom with sea view" },
  { src: "/images/hero-side-living.jpg", alt: "Living room with curved sofa" },
  { src: "/images/deals-feature.jpg", alt: "White villa with palms" },
  { src: "/images/deals-bedroom.jpg", alt: "Master bedroom with an upholstered headboard wall" },
  { src: "/images/deals-dining.jpg", alt: "Dining room under a ring chandelier" },
  { src: "/images/deals-piano-lounge.jpg", alt: "Piano lounge with glazed doors onto the water" },
  { src: "/images/deals-pool-terrace.jpg", alt: "Pool terrace with a sunken lounge" },
  { src: "/images/project-home-sofa-dusk.jpg", alt: "A family together on a sofa by the window as the light goes" },
  { src: "/images/project-home-bright-room.jpg", alt: "Parents and children playing in a bright, open living room" },
  { src: "/images/project-home-board-game.jpg", alt: "A family around a board game on the living room floor" },
  { src: "/images/project-home-doorway-reading.jpg", alt: "A woman reading in a doorway while coffee is made in the kitchen behind" },
  { src: "/images/project-home-kitchen-couple.jpg", alt: "A couple cooking and talking together in their kitchen" },
  { src: "/images/project-home-window-mug.jpg", alt: "A woman with a warm drink on the couch beside a window" },
  { src: "/images/gallery-vale-house.png", alt: "Sunlit dining corner with a timber sideboard" },
  { src: "/images/gallery-meridian.png", alt: "Arched alcove above a dark dining table" },
  { src: "/images/gallery-birch-lane.png", alt: "Living room with a leather sofa" },
  { src: "/images/gallery-croft-end.png", alt: "Bright apartment with floor-to-ceiling glazing" },
  { src: "/images/gallery-the-granary.png", alt: "Dark stone kitchen with a marble island" },
  { src: "/images/gallery-studio-six.png", alt: "Pale studio corner with open shelving" },
  { src: "/images/hero-main.png", alt: "Interior with a view" },
  { src: "/images/hero-left.png", alt: "Interior detail" },
  { src: "/images/hero-right.jpg", alt: "Interior detail" },
  { src: "/images/expertise-residential.jpg", alt: "Residential interior" },
  { src: "/images/expertise-commercial.jpg", alt: "Commercial interior" },
  { src: "/images/project-serenity-villa.jpg", alt: "Villa exterior" },
  { src: "/images/project-minimalist-apartment.png", alt: "Minimalist apartment" },
  { src: "/images/project-corporate-office.png", alt: "Corporate office" },
  { src: "/images/footer-image.jpg", alt: "Interior" },
];

const media: MediaItem[] = SEED_IMAGES.map((m) => ({ ...m, archived: false, addedAt: NOW, source: "seed" }));

const prop = (p: Omit<Property, "id" | "updatedAt" | "archived" | "order"> & { order?: number }): Property => ({
  id: `p_${p.slug}`,
  archived: false,
  order: p.order ?? 0,
  updatedAt: NOW,
  ...p,
});

/** Dubai proxies (AED, sq ft). Residential ~AED 1,300–2,800/sq ft, offices ~1,750, warehouses ~600–800, villas ~1,800–4,600. */
const properties: Property[] = [
  prop({ slug: "marina-residence-2br", name: "Marina Residence", category: "Residential", community: "Dubai Marina", type: "Apartment", status: "Ready", priceAed: 2_950_000, areaSqft: 1_450, bedrooms: 2, bathrooms: 3, unitsAvailable: 4, handover: "Ready", developer: "Emaar", images: ["/images/deals-bedroom.jpg", "/images/hero-side-living.jpg", "/images/hero-dubai-balcony.jpg"], highlights: ["Full marina view", "Wraparound terrace", "Two parking bays", "Chiller-free"], description: "A corner two-bedroom on a high floor with the marina on two sides, a wraparound terrace and a fitted kitchen open to the living room.", featured: true, order: 1 }),
  prop({ slug: "downtown-loft-1br", name: "Creek Loft", category: "Residential", community: "Downtown Dubai", type: "Apartment", status: "Ready", priceAed: 1_950_000, areaSqft: 780, bedrooms: 1, bathrooms: 2, unitsAvailable: 2, handover: "Ready", developer: "Emaar", images: ["/images/gallery-croft-end.png", "/images/gallery-birch-lane.png"], highlights: ["Double-height glazing", "Burj view from the bedroom", "Furnished"], description: "A double-height one-bedroom loft with floor-to-ceiling glazing towards the Burj, furnished and ready to move into.", featured: true, order: 2 }),
  prop({ slug: "hills-penthouse", name: "Hills Penthouse", category: "Residential", community: "Dubai Hills Estate", type: "Penthouse", status: "Off-plan", priceAed: 9_800_000, areaSqft: 3_900, bedrooms: 4, bathrooms: 5, unitsAvailable: 1, handover: "Q4 2027", developer: "Emaar", images: ["/images/deals-piano-lounge.jpg", "/images/deals-dining.jpg"], highlights: ["Rooftop garden", "Golf course view", "Private lift lobby", "60/40 payment plan"], description: "A top-floor penthouse over the golf course with a rooftop garden and a private lift lobby, on a 60/40 plan to handover.", featured: true, order: 3 }),
  prop({ slug: "jvc-studio", name: "Studio One", category: "Residential", community: "Jumeirah Village Circle", type: "Apartment", status: "Ready", priceAed: 620_000, areaSqft: 420, bedrooms: 0, bathrooms: 1, unitsAvailable: 6, handover: "Ready", developer: "Binghatti", images: ["/images/gallery-studio-six.png", "/images/gallery-vale-house.png"], highlights: ["Smart storage", "Park view", "8% gross yield"], description: "A compact studio with built-in storage over the park, let at an 8% gross yield.", featured: true, order: 4 }),
  prop({ slug: "business-bay-office", name: "Bay Office Floor", category: "Commercial", community: "Business Bay", type: "Office", status: "Ready", priceAed: 3_150_000, areaSqft: 1_800, bedrooms: null, bathrooms: 2, unitsAvailable: 3, handover: "Ready", developer: "DAMAC", images: ["/images/project-corporate-office.png", "/images/expertise-commercial.jpg"], highlights: ["Fitted and partitioned", "Canal view", "Four parking bays", "Grade A tower"], description: "A fitted office floor in a Grade A tower on the canal, partitioned into a boardroom, six offices and an open plan.", featured: true, order: 1 }),
  prop({ slug: "difc-office", name: "Gate Avenue Suite", category: "Commercial", community: "DIFC", type: "Office", status: "Ready", priceAed: 6_400_000, areaSqft: 2_450, bedrooms: null, bathrooms: 2, unitsAvailable: 1, handover: "Ready", developer: "DIFC", images: ["/images/expertise-commercial.jpg", "/images/gallery-meridian.png"], highlights: ["DIFC licence eligible", "Shell and core", "Direct Gate Avenue access"], description: "A shell-and-core suite within the DIFC free zone with direct access to Gate Avenue.", featured: true, order: 2 }),
  prop({ slug: "jbr-retail", name: "The Walk Retail Unit", category: "Commercial", community: "Jumeirah Beach Residence", type: "Retail", status: "Ready", priceAed: 4_200_000, areaSqft: 1_200, bedrooms: null, bathrooms: 1, unitsAvailable: 1, handover: "Ready", developer: "Dubai Properties", images: ["/images/gallery-vale-house.png", "/images/project-minimalist-apartment.png"], highlights: ["Beachfront footfall", "Outdoor seating licence", "Corner unit"], description: "A corner retail unit on The Walk with an outdoor seating licence and beachfront footfall.", featured: false, order: 3 }),
  prop({ slug: "al-quoz-warehouse", name: "Al Quoz Warehouse", category: "Warehouse", community: "Al Quoz Industrial 3", type: "Warehouse", status: "Ready", priceAed: 9_500_000, areaSqft: 12_000, bedrooms: null, bathrooms: 2, unitsAvailable: 1, handover: "Ready", developer: "Private", images: ["/images/project-corporate-office.png", "/images/gallery-the-granary.png"], highlights: ["9m eaves", "Two loading docks", "Mezzanine office", "3-phase power"], description: "A 12,000 sq ft warehouse with 9m eaves, two loading docks and a mezzanine office, minutes from Sheikh Zayed Road.", featured: true, order: 1 }),
  prop({ slug: "jafza-logistics", name: "JAFZA Logistics Unit", category: "Warehouse", community: "Jebel Ali Free Zone", type: "Warehouse", status: "Off-plan", priceAed: 14_000_000, areaSqft: 25_000, bedrooms: null, bathrooms: 4, unitsAvailable: 2, handover: "Q2 2027", developer: "DP World", images: ["/images/gallery-the-granary.png", "/images/expertise-commercial.jpg"], highlights: ["Free zone licence", "Temperature-controlled bay", "Port adjacent"], description: "A temperature-controlled logistics unit adjacent to the port, with a free-zone licence included.", featured: true, order: 2 }),
  prop({ slug: "palm-villa", name: "Palm Villa", category: "Villas", community: "Palm Jumeirah", type: "Villa", status: "Ready", priceAed: 28_500_000, areaSqft: 7_200, bedrooms: 5, bathrooms: 6, unitsAvailable: 1, handover: "Ready", developer: "Nakheel", images: ["/images/deals-pool-terrace.jpg", "/images/deals-feature.jpg", "/images/deals-piano-lounge.jpg"], highlights: ["Private beach", "Infinity pool", "Staff quarters", "Upgraded interiors"], description: "A garden-home villa on the fronds with a private beach, an infinity pool and fully upgraded interiors.", featured: true, order: 1 }),
  prop({ slug: "ranches-villa", name: "Ranches Family Villa", category: "Villas", community: "Arabian Ranches III", type: "Villa", status: "Ready", priceAed: 6_800_000, areaSqft: 3_800, bedrooms: 4, bathrooms: 5, unitsAvailable: 2, handover: "Ready", developer: "Emaar", images: ["/images/deals-feature.jpg", "/images/deals-dining.jpg"], highlights: ["Single row", "Landscaped garden", "Maid's room", "Near the school"], description: "A single-row four-bedroom on a landscaped plot, a short walk from the community school.", featured: true, order: 2 }),
  prop({ slug: "damac-hills-villa", name: "Hills Golf Villa", category: "Villas", community: "DAMAC Hills", type: "Villa", status: "Off-plan", priceAed: 9_200_000, areaSqft: 5_100, bedrooms: 5, bathrooms: 6, unitsAvailable: 3, handover: "Q1 2028", developer: "DAMAC", images: ["/images/project-serenity-villa.jpg", "/images/deals-pool-terrace.jpg"], highlights: ["Golf course frontage", "Private pool", "80/20 payment plan"], description: "A five-bedroom on the golf course with a private pool, on an 80/20 plan with handover in 2028.", featured: true, order: 3 }),
  prop({ slug: "creek-townhouse", name: "Canal Townhouse", category: "Villas", community: "Dubai Creek Harbour", type: "Townhouse", status: "Off-plan", priceAed: 4_600_000, areaSqft: 2_650, bedrooms: 3, bathrooms: 4, unitsAvailable: 5, handover: "Q3 2027", developer: "Emaar", images: ["/images/hero-side-living.jpg", "/images/gallery-croft-end.png"], highlights: ["Waterfront", "Own mooring", "Roof terrace"], description: "A three-storey townhouse on the water with its own mooring and a roof terrace towards the creek.", featured: false, order: 4 }),
];

export function seedContent(): SiteContent {
  return {
    version: 1,
    updatedAt: NOW,
    hero: {
      headline: [HERO.headline[0], HERO.headline[1]],
      labels: [HERO.labels[0], HERO.labels[1]],
      paragraph: HERO.paragraph,
      link: { ...HERO.link },
      cta: { ...(HERO.cta ?? { label: "Book a visit", href: "#hot-deals" }) },
      mainImage: HERO.mainImage,
      leftImage: HERO.leftImage,
      rightImage: HERO.rightImage,
    },
    work: {
      eyebrow: PROJECT_MARQUEE_SECTION.eyebrow,
      heading: PROJECT_MARQUEE_SECTION.heading,
      subtitle: PROJECT_MARQUEE_SECTION.subtitle,
      link: { ...PROJECT_MARQUEE_SECTION.link },
      images: PROJECT_MARQUEE.map((p) => ({ src: p.image, alt: p.alt })),
      stats: [...STATS_TICKER],
      figure: { enabled: true, value: 100, suffix: "+", label: "People we have helped find a place they love" },
    },
    categories: {
      eyebrow: PROJECT_TABS_SECTION.eyebrow,
      heading: PROJECT_TABS_SECTION.heading,
      enquiry: {
        title: "Nothing quite right?",
        text: "Tell us what you are looking for in {category} and we will send matching options within a day.",
        cta: "Enquire about {category}",
      },
      viewAll: "See all {count} {category}",
    },
    listings: {
      eyebrow: "Every listing",
      heading: "Find your place in Dubai.",
      subtitle: "Filter by category, status, size and price. Everything on our books, updated as it moves.",
      empty: "Nothing matches those filters yet. Widen them, or tell us what you are looking for and we will go and find it.",
    },
    deals: {
      eyebrow: DEALS_SECTION.eyebrow,
      heading: DEALS_SECTION.heading,
      propertyId: "p_palm-villa",
      photoOverride: null,
      visit: { title: DEALS[0].title, description: DEALS[0].description },
      pricing: { title: null, description: DEALS[1].description, sizes: [...DEALS_SIZES] },
      gallery: null,
      booking: {
        slots: [...DEALS_VISIT.slots],
        leadMinutes: 60,
        monthsAhead: 6,
        durationMinutes: DEALS_VISIT.durationMinutes,
        place: DEALS_VISIT.place,
        timezoneLabel: DEALS_VISIT.timezone.label,
        utcOffsetMinutes: DEALS_VISIT.timezone.utcOffsetMinutes,
      },
    },
    services: {
      eyebrow: AGENCY_SERVICES_SECTION.eyebrow,
      heading: AGENCY_SERVICES_SECTION.heading,
      cta: AGENCY_SERVICES_SECTION.cta,
      items: AGENCY_SERVICES.map((s) => ({ category: s.category, title: s.title, description: s.description, image: s.image, detail: { ...s.detail, bullets: [...s.detail.bullets] } })),
    },
    partners: {
      enabled: true,
      eyebrow: "Developers we work with",
      items: ["Emaar", "Meraas", "DAMAC", "Nakheel", "Sobha", "Dubai Properties", "Ellington", "Binghatti", "Azizi", "Danube"].map((name) => ({ id: `partner_${name.toLowerCase().replace(/\s+/g, "-")}`, name, logo: null, enabled: true, archived: false })),
    },
    statement: {
      enabled: true,
      word: "Riyaz",
      heading: { lead: "Dubai addresses chosen for", italic: "how you", tail: "live." },
      paragraph:
        "A Dubai agency for homes, offices, warehouses and villas. We show the thinking behind every shortlist, including the trade-offs we would make ourselves.",
      cta: { label: "See our work", href: "#work" },
      secondary: { label: "Let\u2019s talk", href: "#contact" },
      image: "/project/riyaz.png",
    },
    visit: {
      heading: SCATTER_SECTION.heading,
      paragraph: SCATTER_SECTION.paragraph,
      cta: { ...SCATTER_SECTION.cta },
      images: SCATTER_SECTION.images.map((i) => ({ ...i })),
    },
    footer: {
      collab: { ...SITE_FOOTER.collab },
      marquee: SITE_FOOTER.marquee.text,
      outline: SITE_FOOTER.outline,
      copyright: SITE_FOOTER.copyright,
    },
    contact: {
      phone: CONTACT.phone,
      whatsapp: CONTACT.whatsapp,
      email: CONTACT.email,
      address: CONTACT.address,
      hours: CONTACT.hours,
      socials: CONTACT.socials.map((s) => ({ ...s })),
    },
    media,
    properties,
  };
}
