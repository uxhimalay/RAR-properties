import type {
  ExpertiseCard,
  FooterLinkGroup,
  HeroContent,
  MarqueePanel,
  NavLink,
  ProcessStep,
  Project,
  Review,
  Service,
 AgencyService } from "@/types/content";

export const SITE_NAME = "RAR Properties";

/** Nav wordmark: lowercase brand with a trailing period, as on the reference nav. */
export const NAV_BRAND = "rar.";

/** Links inside the full-width menu that drops down from the "MENU +" button. */
/** Every entry is an in-page anchor; each id exists on the page (see page.tsx). */
export const MENU_LINKS: NavLink[] = [
  { label: "Home", href: "/#top" },
  { label: "Work", href: "/#work" },
  { label: "Properties", href: "/properties" },
  { label: "Hot deals", href: "/#hot-deals" },
  { label: "Services", href: "/#services" },
  { label: "Book a visit", href: "/#visit" },
  { label: "Contact", href: "/#contact" },
];

/** The nav's gold pill; opens the enquiry drawer. */
export const NAV_CTA = "Enquire";

export const HERO: HeroContent = {
  headline: ["RAR PROPERTIES", ""],
  labels: ["Based in Dubai", "RAR Properties"],
  paragraph:
    "RAR Properties helps buyers, investors, and families discover and secure premier residential and commercial properties in and around Dubai.",
  link: { label: "View our work", href: "#work" },
  cta: { label: "Book a visit", href: "#hot-deals" },
  mainImage: "/images/hero-dubai-balcony.jpg",
  leftImage: "/images/hero-side-bedroom.jpg",
  rightImage: "/images/hero-side-living.jpg",
};

/**
 * Image panels for the full-bleed black marquee section.
 * Background + scroll behaviour are modelled on the project reference's dark band;
 * the 3D rotated-panel treatment is modelled on the "material" section of
 * a second project reference (both measured 2026-09-18). Panels are image-only, as on the reference.
 */
/** Header above the marquee, laid out like the project reference's material section header. */
export const PROJECT_MARQUEE_SECTION = {
  eyebrow: "Selected Work",
  heading: "Shaped by How You Live",
  subtitle: "Homes and workplaces across Dubai, since 2014.",
  link: { label: "Explore by category", href: "#categories" },
};

/** Header above the category tabs in the stepped white panel (heading styled like the project reference). */
export const PROJECT_TABS_SECTION = {
  eyebrow: "Explore our work by category",
  heading: "Spaces for every purpose.",
};

/** Category tabs shown in the stepped white panel (the project reference's bitten-corner button style). */
export const PROJECT_TABS = ["Residential", "Commercial", "Warehouse", "Villas"] as const;

/**
 * Fourth section: hot deals on the property, in the card language taken from the project reference's
 * "How We Get It Done" (see docs/research/components/process-cards.spec.md) and recomposed as a bento.
 */
export const DEALS_SECTION = {
  eyebrow: "Hot deals",
  heading: "Limited-time offers on this property.",
};

/** One deal per card; the illustration each card carries is fixed (strip, ruler, gauge, ticker). */
export const DEALS = [
  { title: "Book a visit", description: "Walk the property with us any day this week. Choose a date and we keep it for you, no obligation." },
  { title: "From AED 1,850 per sq ft", description: "Launch pricing on the remaining units, from 1,200 to 4,800 sq ft." },
  { title: "62% already reserved", description: "Over half the units are gone. The rest keep the launch price until month end." },
  { title: "Included at no extra cost", description: "Every reservation this month comes with the extras below." },
] as const;

/** The booking flow on card 01: visit times offered per day, and the copy around the calendar. */
export const DEALS_VISIT = {
  hint: "Pick a day",
  /** Start times, in the property's own time zone. */
  slots: ["10:00", "11:30", "14:00", "16:30"],
  /** Visits happen in Dubai, which has no daylight saving, so the offset is fixed. */
  timezone: { label: "GST", utcOffsetMinutes: 240 },
  durationMinutes: 45,
  place: "At the property, with an RAR property specialist",
  back: "Back",
  timeLabel: "Visit time",
  noTimesToday: "No times left today",
  continue: "Continue",
  details: {
    title: "Your details",
    name: "Name",
    email: "Email",
    phone: "Phone (optional)",
    privacy: "We only use your details to arrange this visit.",
    confirm: "Confirm booking",
    pending: "Booking\u2026",
    errors: {
      name: "Enter your name",
      email: "Enter a valid email address",
      phone: "Enter a valid phone number",
      failed: "Something went wrong. Please try again.",
    },
  },
  booked: {
    title: "Visit booked",
    /** `{email}` is replaced with the address given. */
    note: "We will email {email} to confirm.",
    addToCalendar: "Add to calendar",
    change: "Change booking",
    calendarTitle: "Property visit \u2013 ArcSphere Studio",
  },
} as const;

/** Card 02's link; opens the enquiry drawer with "Price list" as the subject. */
export const DEALS_PRICE_CTA = "Request the price list";

/** Photograph filling the wide top-left cell of the deals grid (supplied by the user). */
export const DEALS_PHOTO = { src: "/images/deals-feature.jpg", alt: "Photograph of the property" };

/** Rooms of the property in the deals grid's click row (project reference's project-row style); photos supplied by the user. */
export const DEALS_GALLERY = [
  { title: "Master bedroom", description: "Upholstered headboard wall, navy accents and a crystal chandelier.", image: "/images/deals-bedroom.jpg" },
  { title: "Dining room", description: "Marble table for twelve under a ring chandelier, open to the kitchen and stair.", image: "/images/deals-dining.jpg" },
  { title: "Piano lounge", description: "Grand piano on a round rug, with glazed doors onto the water.", image: "/images/deals-piano-lounge.jpg" },
  { title: "Pool terrace", description: "Timber deck with a sunken lounge, pool and sea views.", image: "/images/deals-pool-terrace.jpg" },
] as const;

/** Figures under the ruler on the pricing card: unit sizes in thousands of sq ft. */
export const DEALS_SIZES = ["1.2k", "1.9k", "2.6k", "3.3k", "4.0k", "4.8k"] as const;

/** Share of units reserved, shown on the gauge. */
export const DEALS_RESERVED_PERCENT = 62;

/** Extras ticking past on the inclusions card. */
export const DEALS_EXTRAS = ["Fitted kitchen", "Two parking bays", "Zero commission", "Furniture package", "Smart-home setup", "Pool & gym access"] as const;

export const DEALS_CTA = {
  label: "Early-buyer offer",
  heading: "Reserve before the 30th and take 10% off the list price.",
  link: { label: "Claim the offer", href: "/contact" },
  image: "/images/gallery-croft-end.png",
};

export const PROJECT_MARQUEE: MarqueePanel[] = [
  { image: "/images/project-home-sofa-dusk.jpg", alt: "A family together on a sofa by the window as the light goes" },
  { image: "/images/project-home-bright-room.jpg", alt: "Parents and children playing in a bright, open living room" },
  { image: "/images/project-home-board-game.jpg", alt: "A family around a board game on the living room floor" },
  { image: "/images/project-home-doorway-reading.jpg", alt: "A woman reading in a doorway while coffee is made in the kitchen behind" },
  { image: "/images/project-home-kitchen-couple.jpg", alt: "A couple cooking and talking together in their kitchen" },
  { image: "/images/project-home-window-mug.jpg", alt: "A woman with a warm drink on the couch beside a window" },
];

export const ABOUT = {
  heading: "Designing Timeless Spaces With Purpose",
  paragraph:
    "We offer a complete range of architecture and interior design services tailored to create spaces.",
  leftImage: "/images/about-left.png",
  rightImage: "/images/about-right.png",
};

/** Figures are placeholders until the agency supplies its own. */
export const STATS_TICKER = [
  "RERA-registered brokers",
  "1,200+ homes sold and let",
  "AED 2.4bn transacted",
  "In Dubai since 2014",
];

export const PROJECTS_SECTION = {
  heading: "FEATURED PROJECTS",
  subtitle: "A selection of our recent architecture and interior design work.",
  viewMore: { label: "View more projects", href: "/projects" },
};

export const PROJECTS: Project[] = [
  {
    title: "Corporate Office space",
    category: "Commercial Architecture",
    meta: "new york, 2026",
    image: "/images/project-corporate-office.png",
  },
  {
    title: "Serenity Villa",
    category: "Residential Architecture",
    meta: "Dubai, 2025",
    image: "/images/project-serenity-villa.jpg",
    href: "/projects/serenity-villa",
    tall: true,
  },
  {
    title: "Minimalist Appartment interior",
    category: "Residential Architecture",
    meta: "london, 2025",
    image: "/images/project-minimalist-apartment.png",
  },
];

export const SERVICES_SECTION = {
  heading: "Our Services",
  subtitle: "End-to-end design services from concept to completion.",
};

const SERVICE_HOURS = "Sun - Sat, 9:00 - 19:00";
const SERVICE_LOCATION = "Dubai, UAE";

export const SERVICES: Service[] = [
  {
    title: "Architectural",
    description:
      "Designing modern buildings that combine aesthetics, efficiency, and long-term value.",
    image: "/images/service-architectural.png",
    detail: {
      title: "ARCHITECTURAL DESIGN",
      hours: SERVICE_HOURS,
      location: SERVICE_LOCATION,
      description:
        "Designing modern buildings that combine aesthetics, efficiency, and long-term value.",
      bullets: [
        "Comprehensive site analysis and zoning compliance.",
        "Innovative conceptual design and detailed floor plans.",
        "Structural coordination and sustainable material selection.",
        "Detailed construction documentation and blueprint generation.",
        "Permit-ready architectural drawings and engineering alignment.",
      ],
      summary: "Homes, offices, and commercial structures.",
      price: "250 AED / Hour",
    },
  },
  {
    title: "Interior Design",
    description:
      "Creating refined interiors through thoughtful materials, lighting, and spatial composition.",
    image: "/images/service-interior-design.png",
    detail: {
      title: "INTERIOR DESIGN",
      hours: SERVICE_HOURS,
      location: SERVICE_LOCATION,
      description:
        "Creating refined interiors through thoughtful materials, lighting, and spatial composition.",
      bullets: [
        "Bespoke mood boards, color palettes, and texture curation.",
        "Custom furniture, fixtures, and equipment (FF&E) sourcing.",
        "Detailed ceiling, flooring, and custom millwork detailing.",
        "Intelligent lighting layouts to enhance ambiance and utility.",
        "Material scheduling and interior finish specifications.",
      ],
      summary: "Living, retail, and workspace interiors customized to your lifestyle.",
      price: "180 AED / Hour",
    },
  },
  {
    title: "Renovation & Remodeling",
    description:
      "Transforming outdated spaces into modern and carefully designed environments",
    image: "/images/service-renovation.png",
    detail: {
      title: "RENOVATION & REMODELING",
      hours: SERVICE_HOURS,
      location: SERVICE_LOCATION,
      description:
        "Transforming outdated spaces into modern, functional, and carefully designed environments.",
      bullets: [
        "Structural assessment and adaptive reuse feasibility studies.",
        "Demolition planning and smart layout re-engineering",
        "Modern utility upgrading (electrical, plumbing, and HVAC integration).",
        "High-end finish upgrades and architectural face-lifts.",
        "Phased construction scheduling to minimize project downtime.",
      ],
      summary: "Giving historic, old, or underutilized structures.",
      price: "200 AED / Hour",
    },
  },
  {
    title: "3D Visualization",
    description:
      "High-quality visualizations that help clients clearly understand the design before construction begins.",
    image: "/images/service-3d-visualization.jpg",
    detail: {
      title: "3D VISUALIZATION",
      hours: SERVICE_HOURS,
      location: SERVICE_LOCATION,
      description:
        "High-quality visualizations that help clients clearly understand the design before construction begins.",
      bullets: [
        "Photorealistic interior and exterior digital rendering.",
        "Immersive 360-degree virtual walkthroughs and panoramic views.",
        "Accurate lighting simulations for daytime and nighttime environments.",
        "Physically-based rendering (PBR) of lifelike textures and materials.",
        "High-definition cinematic animation fly-throughs for presentations.",
      ],
      summary: "Photorealistic digital twins of your project to bridge vision.",
      price: "150 AED / Hour",
    },
  },
  {
    title: "Space Planning",
    description:
      "Optimizing layouts to improve functionality, circulation, and spatial flow.",
    image: "/images/service-space-planning.jpg",
    detail: {
      title: "SPACE PLANNING",
      hours: SERVICE_HOURS,
      location: SERVICE_LOCATION,
      description:
        "Optimizing layouts to improve functionality, circulation, and spatial flow.",
      bullets: [
        "Ergonomic spatial assessment and furniture arrangement mapping.",
        "Strategic traffic-flow analysis for maximum movement efficiency.",
        "Zoning layouts for privacy, collaboration, or high-footfall areas.",
        "Square-footage optimization to eliminate awkward or dead corners.",
        "Flexible layout scaling for future expansion or adaptation.",
      ],
      summary: "Maximizing every square meter of your property for comfort.",
      price: "120 AED / Hour",
    },
  },
  {
    title: "Construction Consultation",
    description:
      "Professional guidance during construction to ensure the design vision is executed correctly.",
    image: "/images/service-construction-consultation.jpg",
    detail: {
      title: "CONSTRUCTION CONSULTATION",
      hours: SERVICE_HOURS,
      location: SERVICE_LOCATION,
      description:
        "Professional guidance during construction to ensure the design vision is executed correctly.",
      bullets: [
        "On-site quality assessments and construction verification visits.",
        "Contractor blueprint clarification and design intent alignment.",
        "Material verification against design specification schedules.",
        "Real-time problem solving for unexpected structural or site issues.",
        "Final hand-off snag list generation and quality sign-off.",
      ],
      summary: "Expert oversight to keep your build on time, on budget.",
      price: "300 AED / Hour",
    },
  },
];

/** The service pop-up's button; opens the enquiry drawer with the service as the subject. */
export const SERVICE_DETAIL_CTA = { label: "Enquire" };

export const EXPERTISE_SECTION = {
  heading: "Project Expertise",
  subtitle: "We design spaces across residential and commercial environments.",
};

export const EXPERTISE: ExpertiseCard[] = [
  {
    title: "Commercial Design",
    subtitle:
      "Functional and visually compelling spaces for offices, retail stores, hospitality, and businesses.",
    statNumber: "16+",
    statLabel: "Commercial Projects Done",
    image: "/images/expertise-commercial.jpg",
    href: "/projects",
  },
  {
    title: "Residential Design",
    subtitle:
      "Thoughtfully designed homes including villas, apartments, and private residences.",
    statNumber: "35+",
    statLabel: "Residencial Projects done",
    image: "/images/expertise-residential.jpg",
    href: "/projects",
  },
];

export const PROCESS_SECTION = {
  heading: "Clear Design Process",
  subtitle: "A collaborative approach from concept to completion.",
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    tag: "RESEARCH",
    title: "Discovery",
    description: "We begin by understanding your goals, requirements, and design vision.",
    image: "/images/process-discovery.png",
    icon: "search",
  },
  {
    number: "02",
    tag: "IDEATION",
    title: "Concept Development",
    description: "Our team develops layouts, ideas, and creative design directions.",
    image: "/images/process-concept-development.png",
    icon: "cube",
  },
  {
    number: "03",
    tag: "MODELLING",
    title: "Design Development",
    description: "Detailed drawings, materials, and spatial specifications are finalized.",
    image: "/images/process-design-development.png",
    icon: "bulb",
  },
  {
    number: "04",
    tag: "DELIVERY",
    title: "execution",
    description:
      "We guide implementation to ensure the final result reflects the original design vision.",
    image: "/images/process-execution.png",
    icon: "check",
  },
];

export const REVIEWS_SECTION = {
  heading: "What Our Clients Say",
  subtitle: "Real experiences from clients who trusted us with their spaces.",
};

export const REVIEWS: Review[] = [
  {
    title: "Game-Changing Experience",
    quote:
      "Working with Claryo brought clarity to decisions I’d delayed for months. Their structure and insights gave me the confidence to make measurable progress.",
    name: "Michael Turner",
    role: "Founder & Business Consultant",
    image: "/images/review-1.jpg",
    avatar: "/images/client-1.jpg",
  },
  {
    title: "The Clarity I Needed",
    quote:
      "This coaching simplified complex challenges so I could focus on what truly mattered. I gained strategic direction and confidence in my path..",
    name: "Elena Rostova",
    role: "Creative Director, Studio Nord",
    image: "/images/review-2.jpg",
    avatar: "/images/client-2.jpg",
  },
  {
    title: "Guidance Right on Time",
    quote:
      "During a period of transition, Claryo provided the exact support I needed to take action. Every session was structured and results-driven.",
    name: "David Miller",
    role: "Head of Product, FinTech Labs",
    image: "/images/review-3.jpg",
    avatar: "/images/client-3.jpg",
  },
  {
    title: "Ideas Turned Into Action",
    quote:
      "I started out feeling overwhelmed. Through focused strategic planning, I walked away with a clear roadmap to succeed.",
    name: "Sarah Jenkins",
    role: "Managing Director, Vanguard Group",
    image: "/images/review-4.jpg",
    avatar: "/images/client-4.jpg",
  },
];

export const QUOTE_CTA = {
  quote: "\"Architecture should speak of its time and place, but yearn for timelessness.\"",
  attribution: "\"Frank Gehry\"",
  image: "/images/cta-quote-bg.png",
  primaryCta: { label: "View Projects", href: "/projects" },
  secondaryCta: { label: "book consultation", href: "/contact" },
};

export const CONTACT = {
  heading: "LET'S TALK ABOUT YOUR PROJECTS",
  paragraph:
    "Every collaboration begins with a conversation. We’d love to hear about your project, idea, or partnership.",
  phoneLabel: "Phone Number",
  /** Placeholder numbers until the agency supplies its own. */
  phone: "+971 4 000 0000",
  whatsapp: "+971 50 000 0000",
  emailLabel: "Email",
  email: "hello@rarproperties.ae",
  emailHref: "mailto:hello@rarproperties.ae",
  socialLabel: "Social Media",
  socials: [
    { name: "InstagramLogo", label: "Instagram", href: "https://www.instagram.com/" },
    { name: "LinkedinLogo", label: "LinkedIn", href: "https://www.linkedin.com/" },
    { name: "XLogo", label: "X", href: "https://x.com/" },
  ],
  addressLabel: "Address",
  address: "Marina Plaza, Level 12, Dubai Marina, Dubai",
  hours: "Sunday to Saturday, 9:00 to 19:00 GST",
  form: {
    heading: "Enter Your Details",
    fields: {
      name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      location: "Your Location",
    },
    serviceSelect: {
      placeholder: "Select Service...",
      options: [
        "Architectural",
        "Interior Design",
        "Renovation & Remodeling",
        "3D Visualization",
        "Space Planning",
        "Construction Consultation",
      ],
    },
    projectType: { label: "Project Type", options: ["Residential", "Commercial"] },
    projectScale: {
      label: "Project Scale",
      options: ["< 2,500 sq ft", "2,500 – 10,000 sq ft", "10,000 – 50,000 sq ft", "> 50,000 sq ft"],
    },
    submit: "Submit",
  },
};

export const FOOTER = {
  heading: "Open to new projects and collaborations that shape meaningful spaces.",
  cta: { label: "get in touch", href: "/" },
  linkGroups: [
    {
      links: [
        { label: "home", href: "/" },
        { label: "about", href: "/#about-section" },
        { label: "services", href: "/#services" },
        { label: "projects", href: "/projects" },
        { label: "process", href: "/" },
        { label: "contact", href: "/" },
      ],
    },
    {
      links: [
        { label: "pinterest", href: "#" },
        { label: "linkedin", href: "#" },
        { label: "instagram", href: "#" },
        { label: "behance", href: "#" },
      ],
    },
    {
      links: [
        { label: "Privacy Policy", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "Terms & Conditions", href: "#" },
      ],
    },
  ] satisfies FooterLinkGroup[],
  iconButtons: [
    { icon: "mail", label: "hello@rarproperties.ae", href: "mailto:hello@rarproperties.ae" },
    { icon: "phone", label: "+971 55 987 6543", href: "tel:+971559876543" },
    { icon: "pin", label: "Dubai, UAE", href: "#" },
  ],
  copyright: "© 2026 Your Architecture Studio. All rights reserved.",
  runningText: "RAR Properties",
  image: "/images/footer-image.jpg",
};

/**
 * Fifth section: an ambient video filling the panel edge to edge (supplied by the user, 1280x720
 * 30fps). Played at half speed: on a 30fps source that is the slowest rate that still reads as
 * smooth motion (each frame is shown twice); lower rates show visible steps.
 */
export const SECTION_FIVE_VIDEO = { src: "/videos/section-five.mp4", playbackRate: 0.5 };

/** Fifth section: the agency's services, on a rail over the ambient video. */
export const AGENCY_SERVICES_SECTION = {
  eyebrow: "Services",
  heading: "Everything your property needs, under one roof.",
  cta: "Learn more",
};

export const AGENCY_SERVICES: AgencyService[] = [
  {
    category: "Buy", title: "Property sales", image: "/images/deals-feature.jpg",
    description: "Ready and off-plan homes across Dubai, shortlisted to your brief and negotiated on your behalf.",
    detail: { title: "Property sales", hours: SERVICE_HOURS, location: SERVICE_LOCATION, description: "We shortlist to your brief, arrange the viewings, check the paperwork and negotiate the price and terms for you.", bullets: ["A shortlist within 48 hours of your brief", "Viewings arranged around your diary", "Title, service charge and developer checks", "Negotiation and offer handling", "Trustee and transfer appointments booked for you"], summary: "Ready and off-plan, apartments to villas.", price: "Buyer pays no fee on off-plan" },
  },
  {
    category: "Rent", title: "Leasing", image: "/images/deals-bedroom.jpg",
    description: "Long and short lets, listed, shown and signed for you, with tenants vetted before they view.",
    detail: { title: "Leasing", hours: SERVICE_HOURS, location: SERVICE_LOCATION, description: "For landlords we list, show and sign; for tenants we find, negotiate and register the contract.", bullets: ["Professional photography and listing on the major portals", "Tenant vetting before the first viewing", "Ejari registration handled", "Cheque schedule negotiated", "Renewal reminders and rent reviews"], summary: "Annual and short lets across Dubai.", price: "5% of annual rent" },
  },
  {
    category: "Own", title: "Property management", image: "/images/deals-dining.jpg",
    description: "Tenants, maintenance and statements handled end to end, so the asset works while you do not.",
    detail: { title: "Property management", hours: SERVICE_HOURS, location: SERVICE_LOCATION, description: "Everything between the key handover and your monthly statement, for owners in Dubai or abroad.", bullets: ["Rent collection and arrears follow-up", "24/7 maintenance line with vetted contractors", "Move-in and move-out inspections", "Service charge and DEWA handling", "Monthly statements and annual returns"], summary: "For single units and portfolios.", price: "From 5% of rent" },
  },
  {
    category: "Finance", title: "Mortgage advice", image: "/images/deals-piano-lounge.jpg",
    description: "Pre-approval to keys with lenders across the UAE, for residents and overseas buyers alike.",
    detail: { title: "Mortgage advice", hours: SERVICE_HOURS, location: SERVICE_LOCATION, description: "Independent advice across UAE lenders, from pre-approval to final offer, for residents and non-residents.", bullets: ["Pre-approval within days", "Rates compared across the major banks", "Non-resident and self-employed cases", "Valuation and offer letter coordination", "Refinancing of existing loans"], summary: "Up to 80% loan-to-value for residents.", price: "Free consultation" },
  },
  {
    category: "Invest", title: "Off-plan investment", image: "/images/hero-dubai-balcony.jpg",
    description: "Launches and payment plans from Dubai's leading developers, with the yields laid out plainly.",
    detail: { title: "Off-plan investment", hours: SERVICE_HOURS, location: SERVICE_LOCATION, description: "Access to launches before they are public, with payment plans, expected yields and exit options laid out plainly.", bullets: ["Priority allocation at launches", "Developer track record and escrow checks", "Payment plan and handover timeline comparison", "Projected rental yield and resale analysis", "Assignment and resale support"], summary: "Emaar, Sobha, Damac, Nakheel and more.", price: "No buyer fee" },
  },
  {
    category: "Value", title: "Valuation", image: "/images/deals-pool-terrace.jpg",
    description: "Market appraisals for sale, rent or refinancing, backed by transactions from the last quarter.",
    detail: { title: "Valuation", hours: SERVICE_HOURS, location: SERVICE_LOCATION, description: "A written appraisal built on comparable transactions from the last quarter, for a sale, a let or a bank.", bullets: ["Comparable sales and rents from DLD data", "Inspection and condition notes", "Written report within three working days", "Rental yield estimate", "Advice on presenting the property"], summary: "Sale, rental and refinancing valuations.", price: "Free for clients" },
  },
  {
    category: "Reside", title: "Golden Visa support", image: "/images/hero-side-bedroom.jpg",
    description: "Property-backed residency for you and your family, with the paperwork done alongside the purchase.",
    detail: { title: "Golden Visa support", hours: SERVICE_HOURS, location: SERVICE_LOCATION, description: "The ten-year visa on a qualifying property, handled alongside the purchase so nothing is done twice.", bullets: ["Eligibility check on the property and the buyer", "Title deed and valuation certificate", "Medical, Emirates ID and biometrics appointments", "Family and dependant applications", "Renewal tracking"], summary: "Qualifying properties from AED 2m.", price: "From AED 5,000 per applicant" },
  },
  {
    category: "Finish", title: "Interior fit-out", image: "/images/hero-side-living.jpg",
    description: "Furnishing and finishing by RAR's own studio, ready for you or your first tenant.",
    detail: { title: "Interior fit-out", hours: SERVICE_HOURS, location: SERVICE_LOCATION, description: "From a furniture package to a full refit by the studio RAR grew out of, ready for you or your first tenant.", bullets: ["Furniture packages for rental-ready units", "Kitchen, bathroom and flooring upgrades", "Developer snagging and defect follow-up", "Fixed-price quotes and timelines", "Handover clean and styling"], summary: "Studios to villas.", price: "From AED 25,000" },
  },
];

/**
 * Sixth section: the stacked photos that scatter as you scroll, then the invitation to visit. Built
 * to the project reference's scroll-animation section (measured 2026-09-19, see
 * docs/research/components/scatter-cta-section.spec.md) with our photos and copy.
 */
export const SCATTER_SECTION = {
  heading: "Ready to see it for yourself?",
  paragraph: "From studios to villas, walk the property with us and take your time.",
  cta: { label: "Book a visit", href: "#hot-deals" },
  /** Bottom of the stack first; the last entry sits on top and leaves first. */
  images: [
    { src: "/images/deals-feature.jpg", alt: "Photograph of the property" },
    { src: "/images/hero-side-living.jpg", alt: "Living room" },
    { src: "/images/deals-pool-terrace.jpg", alt: "Pool terrace with a sunken lounge" },
    { src: "/images/hero-dubai-balcony.jpg", alt: "Balcony over Dubai" },
    { src: "/images/deals-piano-lounge.jpg", alt: "Piano lounge with glazed doors onto the water" },
    { src: "/images/hero-side-bedroom.jpg", alt: "Bedroom" },
    { src: "/images/deals-dining.jpg", alt: "Dining room under a ring chandelier" },
    { src: "/images/deals-bedroom.jpg", alt: "Master bedroom with an upholstered headboard wall" },
  ],
};

/** Footer, built to the project reference (see docs/research/components/site-footer.spec.md). */
export const SITE_FOOTER = {
  collab: { text: "Want to talk", italic: "property?" },
  /** The marquee link opens the enquiry drawer. */
  marquee: { text: "Let\u2019s find your place" },
  /** The huge outlined word at the bottom. */
  outline: "RAR",
  contact: { visit: "Visit us", call: "Call or WhatsApp", email: "Write to us" },
  social: CONTACT.socials.map((s) => ({ label: s.label, href: s.href })),
  backToTop: "Back to top",
  copyright: "\u00a9 2026 ArcSphere Real Estate LLC. All rights reserved.",
};


/** The enquiry drawer (src/components/enquiry). */
export const ENQUIRY = {
  eyebrow: "Enquiry",
  title: "Tell us what you are looking for.",
  intro: "A consultant replies within one working day.",
  subjectPrefix: "Regarding",
  fields: { name: "Name", email: "Email", phone: "Phone (optional)", message: "Message (optional)" },
  interestLabel: "I want to",
  interests: ["Buy", "Rent", "Invest", "Sell"],
  privacy: "We only use your details to reply to this enquiry.",
  submit: "Send enquiry",
  pending: "Sending\u2026",
  close: "Close",
  success: { title: "Thank you", note: "We will reply to {email} within one working day." },
  channels: { title: "Or reach us directly", whatsapp: "WhatsApp", call: "Call", email: "Email" },
  errors: { name: "Enter your name", email: "Enter a valid email address", phone: "Enter a valid phone number", failed: "Something went wrong. Please try again." },
};
