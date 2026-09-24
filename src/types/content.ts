export interface NavLink {
  label: string;
  href: string;
}

export interface HeroContent {
  /** Two-line brand headline: the large first line and the smaller second line ("ARCSPHERE" / "STUDIO."). */
  headline: [string, string];
  /** Two short uppercase labels shown beside the headline, separated by "//". */
  labels: [string, string];
  paragraph: string;
  /** Underlined text link in the bottom-right corner of the hero. */
  link: { label: string; href: string };
  /** Second, gold link beside it (the booking call to action). */
  cta?: { label: string; href: string };
  mainImage: string;
  leftImage: string;
  rightImage: string;
}

/** One image panel in the 3D perspective marquee (modelled on the project reference). */
export interface MarqueePanel {
  image: string;
  alt: string;
}

export interface Project {
  title: string;
  category: string;
  meta: string;
  image: string;
  href?: string;
  /** natural aspect ratio (w/h) of the image column */
  tall?: boolean;
}

export interface Service {
  title: string;
  description: string;
  image: string;
  detail?: ServiceDetail;
}

export interface ServiceDetail {
  title: string;
  hours: string;
  location: string;
  description: string;
  bullets: string[];
  summary: string;
  price: string;
  image?: string;
}

export interface ExpertiseCard {
  title: string;
  subtitle: string;
  statNumber: string;
  statLabel: string;
  image: string;
  href: string;
}

export interface ProcessStep {
  number: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  icon: "search" | "cube" | "bulb" | "check";
}

export interface Review {
  title: string;
  quote: string;
  name: string;
  role: string;
  image: string;
  avatar: string;
}

export interface FooterLinkGroup {
  links: { label: string; href: string }[];
}

/** One agency service on the fifth section's rail; opens a ServiceModal with its `detail`. */
export interface AgencyService {
  /** Short category word shown top-right ("Buy", "Rent", ...). */
  category: string;
  title: string;
  description: string;
  /** Photo for the detail pop-up. */
  image: string;
  detail: ServiceDetail;
}
