"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/motion/FadeUp";
import { TextReveal } from "@/components/motion/TextReveal";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { categorySlug, isRemoteImage, priceLabel, pricePerSqft, sqftLabel, type Property } from "@/lib/cms/schema";

/* ------------------------------------------------------------------------------------------------
 * PropertyDetail: the page a category card opens.
 *
 * Cover photo with the name over it; then the description and highlights on the left and a facts
 * card on the right (price, price per sq ft, size, beds and baths, status, handover, developer,
 * units), with the two calls to action: Book a visit (the booking card on the home page, with the
 * property carried as the subject) and Enquire (the drawer). The remaining photos follow as a grid.
 * Cream page, ink type, gold labels, dashed hairlines: the deals cards' language in daylight.
 * ---------------------------------------------------------------------------------------------- */

import { HEADING_PAGE, LABEL } from "@/lib/design";
const GOLD = "var(--color-gold-ink)"; // the page is cream; the dark hero uses --color-gold-light
const INK = "var(--color-ink)";
const LINE = "rgba(79, 71, 66, 0.22)";
const EASE = [0.16, 1, 0.3, 1] as const;

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed py-3" style={{ borderColor: LINE }}>
      <span className={LABEL} style={{ color: "var(--color-ink-2)" }}>{label}</span>
      <span className="font-inter text-[15px] font-medium tracking-[-0.2px]" style={{ color: INK }}>{value}</span>
    </div>
  );
}

export function PropertyDetail({ property }: { property: Property }) {
  const enquiry = useEnquiry();
  const [cover, ...rest] = property.images.length ? property.images : ["/images/deals-feature.jpg"];
  const facts: [string, string][] = [
    ["Price per sq ft", `AED ${pricePerSqft(property).toLocaleString("en-US")}`],
    ["Size", sqftLabel(property.areaSqft)],
    ...(property.bedrooms !== null ? [[property.bedrooms === 0 ? "Layout" : "Bedrooms", property.bedrooms === 0 ? "Studio" : String(property.bedrooms)] as [string, string]] : []),
    ...(property.bathrooms !== null ? [["Bathrooms", String(property.bathrooms)] as [string, string]] : []),
    ["Status", property.status],
    ["Handover", property.handover],
    ...(property.developer ? [["Developer", property.developer] as [string, string]] : []),
    ...(property.unitsAvailable !== null ? [["Units available", String(property.unitsAvailable)] as [string, string]] : []),
    ["Type", property.type],
  ];

  return (
    <article className="w-full bg-cream">
      {/* cover */}
      <div className="relative h-[70svh] min-h-[480px] w-full overflow-hidden bg-black">
        <motion.div className="absolute inset-0" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: EASE }}>
          <Image src={cover} alt={property.name} fill priority sizes="100vw" unoptimized={isRemoteImage(cover)} className="object-cover" />
        </motion.div>
        {/* The cover carries the label and the name. Measured against the seeded photograph the gold
            label read 3.69:1 through the old gradient, so the middle stop is darker: 6.3:1 now, and it
            holds for a brighter photograph too. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-5 pb-10 tablet:px-10 tablet:pb-14">
          <FadeUp onMount delay={0.2}>
            <Link href={`/properties/${categorySlug(property.category)}`} className={`${LABEL} hit-slop inline-flex items-center gap-2 py-1 text-white/70 outline-none transition-colors hover:text-white focus-visible:text-white`}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ transform: "scaleX(-1)" }}><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
              All {property.category.toLowerCase()}
            </Link>
          </FadeUp>
          <p className={LABEL} style={{ color: "var(--color-gold-light)" }}>{property.category} · {property.community}</p>
          <TextReveal as="h1" preset="hero-heading" startOnMount delay={0.15} text={property.name} className={`text-white ${HEADING_PAGE}`} />
        </div>
      </div>

      {/* body */}
      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-12 px-5 py-14 tablet:px-10 desktop:grid-cols-[1fr_420px] desktop:gap-20 desktop:py-20">
        <div className="flex flex-col gap-10">
          <FadeUp>
            <p className="max-w-[640px] font-inter text-[18px] font-medium leading-[1.5] tracking-[-0.2px]" style={{ color: INK }}>{property.description}</p>
          </FadeUp>
          {property.highlights.length > 0 && (
            <FadeUp delay={0.1}>
              <div className="flex flex-col gap-4">
                <p className={LABEL} style={{ color: GOLD }}>Highlights</p>
                <ul className="grid grid-cols-1 gap-x-10 tablet:grid-cols-2">
                  {property.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-3 border-b border-dashed py-3 font-inter text-[15px] font-medium tracking-[-0.2px]" style={{ borderColor: LINE, color: INK }}>
                      <span aria-hidden="true" className="block h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: GOLD }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          )}
          {rest.length > 0 && (
            <div className="grid grid-cols-2 gap-3 tablet:gap-4">
              {rest.map((src, i) => (
                <motion.div key={`${src}-${i}`} className="relative aspect-[4/3] overflow-hidden" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}>
                  <Image src={src} alt={`${property.name} photo ${i + 2}`} fill sizes="(min-width: 1200px) 560px, 50vw" unoptimized={isRemoteImage(src)} className="object-cover" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* facts + actions */}
        <FadeUp delay={0.1} className="desktop:sticky desktop:top-24 desktop:self-start">
          <div className="flex flex-col gap-6 border border-dashed p-6 tablet:p-8" style={{ borderColor: LINE }}>
            <div className="flex flex-col gap-1">
              <p className={LABEL} style={{ color: GOLD }}>{property.status === "Off-plan" ? "From" : "Asking"}</p>
              <p className="font-display text-[40px] font-normal leading-none tracking-[-0.02em]" style={{ color: INK }}>{priceLabel(property.priceAed)}</p>
              <p className="font-inter text-[13px] font-medium" style={{ color: "var(--color-ink-2)" }}>AED {property.priceAed.toLocaleString("en-US")}</p>
            </div>
            <div className="flex flex-col">
              {facts.map(([label, value]) => (
                <Fact key={label} label={label} value={value} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/#hot-deals" className={`${LABEL} flex h-12 items-center justify-center bg-[var(--color-gold)] text-black outline-none transition-colors hover:bg-[var(--color-gold-light)] focus-visible:bg-[var(--color-gold-light)]`}>
                Book a visit
              </Link>
              <button type="button" onClick={() => enquiry.open(`${property.name}, ${property.community}`)} className={`${LABEL} flex h-12 cursor-pointer items-center justify-center border outline-none transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] focus-visible:border-[var(--color-gold)]`} style={{ borderColor: "rgba(79, 71, 66, 0.4)", color: INK }}>
                Enquire about this property
              </button>
            </div>
          </div>
        </FadeUp>
      </div>
    </article>
  );
}

export default PropertyDetail;
