/* ------------------------------------------------------------------------------------------------
 * The site's content document: everything the admin can change, in one JSON object.
 * See docs/cms/PLAN.md for what each part drives on the page.
 * ---------------------------------------------------------------------------------------------- */

export const CATEGORIES = ["Residential", "Commercial", "Warehouse", "Villas"] as const;
export type Category = (typeof CATEGORIES)[number];

export const PROPERTY_TYPES = ["Apartment", "Penthouse", "Townhouse", "Villa", "Office", "Retail", "Warehouse", "Plot"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const STATUSES = ["Ready", "Off-plan"] as const;
/** Web address for a category, and back again: /properties/residential. */
export const categorySlug = (c: Category) => c.toLowerCase();
export const categoryFromSlug = (slug: string): Category | null => CATEGORIES.find((c) => categorySlug(c) === slug.toLowerCase()) ?? null;
export type PropertyStatus = (typeof STATUSES)[number];

export interface Link {
  label: string;
  href: string;
}

export interface Picture {
  src: string;
  alt: string;
}

export interface MediaItem {
  src: string;
  alt: string;
  archived: boolean;
  addedAt: string;
  source: "seed" | "upload";
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  category: Category;
  community: string;
  type: PropertyType;
  status: PropertyStatus;
  /** Asking price in AED. */
  priceAed: number;
  areaSqft: number;
  bedrooms: number | null;
  bathrooms: number | null;
  unitsAvailable: number | null;
  handover: string;
  developer: string;
  /** Media srcs; the first is the cover. */
  images: string[];
  highlights: string[];
  description: string;
  featured: boolean;
  archived: boolean;
  /** Lower first within a category. */
  order: number;
  updatedAt: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string | null;
  enabled: boolean;
  archived: boolean;
}

export interface ServiceItem {
  category: string;
  title: string;
  description: string;
  image: string;
  detail: {
    title: string;
    hours: string;
    location: string;
    description: string;
    bullets: string[];
    summary: string;
    price: string;
  };
}

export interface BookingSettings {
  /** "HH:MM" in the property's zone. */
  slots: string[];
  leadMinutes: number;
  monthsAhead: number;
  durationMinutes: number;
  place: string;
  timezoneLabel: string;
  utcOffsetMinutes: number;
}

export interface SiteContent {
  version: 1;
  updatedAt: string;
  hero: {
    headline: [string, string];
    labels: [string, string];
    paragraph: string;
    link: Link;
    cta: Link;
    mainImage: string;
    leftImage: string;
    rightImage: string;
  };
  work: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    link: Link;
    images: Picture[];
    stats: string[];
    /** The figure at the far end of the header line; it runs up from zero when scrolled to. */
    figure: { enabled: boolean; value: number; suffix: string; label: string };
  };
  categories: {
    eyebrow: string;
    heading: string;
    /** The panel that ends the row; "{category}" is replaced with the open tab's name (lower case). */
    enquiry: { title: string; text: string; cta: string };
    /** The link beside the tabs; "{count}" and "{category}" are replaced. */
    viewAll: string;
  };
  /** The page that lists every property, at /properties. */
  listings: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    /** Shown when the filters match nothing. */
    empty: string;
  };
  deals: {
    eyebrow: string;
    heading: string;
    /** The property the deal is about; null shows the fallbacks below. */
    propertyId: string | null;
    /** Replaces the property's cover in the photo cell when set. */
    photoOverride: string | null;
    visit: { title: string; description: string };
    pricing: {
      /** null = "From AED <price per sq ft> per sq ft" from the property. */
      title: string | null;
      description: string;
      sizes: string[];
    };
    /** null = the property's photos. */
    gallery: (Picture & { title: string })[] | null;
    booking: BookingSettings;
  };
  services: {
    eyebrow: string;
    heading: string;
    cta: string;
    items: ServiceItem[];
  };
  partners: {
    enabled: boolean;
    eyebrow: string;
    items: Partner[];
  };
  /** The full-bleed statement after the partners ribbon (docs/research/components/statement-section.spec.md). */
  statement: {
    enabled: boolean;
    /** Set very large behind the portrait; it drifts against the scroll. */
    word: string;
    /** Three parts: the italic run sits between the two roman ones. */
    heading: { lead: string; italic: string; tail: string };
    paragraph: string;
    /** The underlined link. */
    cta: Link;
    /** The quieter link beside it. */
    secondary: Link;
    /** The portrait. A cut-out on transparency reads best against the black. */
    image: string;
  };
  visit: {
    heading: string;
    paragraph: string;
    cta: Link;
    images: Picture[];
  };
  footer: {
    collab: { text: string; italic: string };
    marquee: string;
    outline: string;
    copyright: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
    socials: { name: string; label: string; href: string }[];
  };
  media: MediaItem[];
  properties: Property[];
}

/* ----------------------------------- helpers ------------------------------------------------- */

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

export const newId = (prefix = "p") => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** "AED 2.95M", "AED 9.8M", "AED 640K", "AED 850" */
export function priceLabel(aed: number): string {
  if (aed >= 1_000_000) return `AED ${Number((aed / 1_000_000).toFixed(2))}M`;
  if (aed >= 1_000) return `AED ${Math.round(aed / 1_000)}K`;
  return `AED ${aed.toLocaleString("en-US")}`;
}

export const pricePerSqft = (p: Pick<Property, "priceAed" | "areaSqft">) => (p.areaSqft > 0 ? Math.round(p.priceAed / p.areaSqft) : 0);

export const sqftLabel = (n: number) => `${n.toLocaleString("en-US")} sq ft`;

/** Live properties of a category, featured first then by order. */
export function propertiesFor(content: Pick<SiteContent, "properties">, category: Category): Property[] {
  return content.properties
    .filter((p) => !p.archived && p.category === category)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);
}

export function findProperty(content: Pick<SiteContent, "properties">, idOrSlug: string | null | undefined): Property | null {
  if (!idOrSlug) return null;
  return content.properties.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
}

/** A photo hosted elsewhere; rendered as-is rather than through the image optimiser. */
export const isRemoteImage = (src: string) => /^https?:\/\//i.test(src);

/** Media that pickers may offer (not archived). */
export const liveMedia = (content: Pick<SiteContent, "media">) => content.media.filter((m) => !m.archived);

/** Everywhere a media src is referenced in the document (for "in use" checks before delete or archive). */
export function mediaReferences(c: SiteContent, src: string): string[] {
  const refs: string[] = [];
  const hit = (where: string, v: string | null | undefined) => v === src && refs.push(where);
  hit("Hero main photo", c.hero.mainImage);
  hit("Hero left photo", c.hero.leftImage);
  hit("Hero right photo", c.hero.rightImage);
  c.work.images.forEach((p, i) => hit(`Work band image ${i + 1}`, p.src));
  hit("Hot deals photo", c.deals.photoOverride);
  c.deals.gallery?.forEach((p, i) => hit(`Hot deals room ${i + 1}`, p.src));
  c.services.items.forEach((s) => hit(`Service: ${s.title}`, s.image));
  c.partners.items.forEach((p) => hit(`Partner: ${p.name}`, p.logo));
  c.visit.images.forEach((p, i) => hit(`Visit section photo ${i + 1}`, p.src));
  c.properties.forEach((p) => p.images.forEach((img) => hit(`Property: ${p.name}`, img)));
  return refs;
}

