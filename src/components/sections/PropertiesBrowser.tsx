"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CATEGORIES, categorySlug, propertiesFor, type Category, type Property } from "@/lib/cms/schema";
import { useSiteContent } from "@/lib/cms/context";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { PropertyCard } from "@/components/sections/PropertyCard";
import { EnquiryPanel } from "@/components/ui/EnquiryPanel";
import { TextReveal } from "@/components/motion/TextReveal";
import { FadeUp } from "@/components/motion/FadeUp";

/* ------------------------------------------------------------------------------------------------
 * PropertiesBrowser: every listing, at /properties (and /properties/<category>).
 *
 * The home page's category row is a shortlist of four; this is the whole book. Category is the web
 * address, so a category page can be linked and indexed; the finer filters (status, bedrooms, price,
 * order) are query parameters kept in the address bar as you change them, so a filtered view can be
 * sent to someone. Twelve at a time, with "Show more", and the enquiry panel always ends the grid.
 * ---------------------------------------------------------------------------------------------- */

import { LABEL } from "@/lib/design";
const LINE = "rgba(79, 71, 66, 0.22)";
const PAGE = 12;
const EASE = [0.16, 1, 0.3, 1] as const;

type Sort = "featured" | "price-asc" | "price-desc" | "size-desc" | "newest";
const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "size-desc", label: "Largest first" },
  { value: "newest", label: "Recently updated" },
];
const BEDS = [
  { value: "", label: "Any bedrooms" },
  { value: "0", label: "Studio" },
  { value: "1", label: "1 bedroom" },
  { value: "2", label: "2 bedrooms" },
  { value: "3", label: "3 bedrooms" },
  { value: "4", label: "4+ bedrooms" },
];
const PRICES = [
  { value: "", label: "Any price" },
  { value: "1000000", label: "Up to AED 1M" },
  { value: "2000000", label: "Up to AED 2M" },
  { value: "5000000", label: "Up to AED 5M" },
  { value: "10000000", label: "Up to AED 10M" },
  { value: "25000000", label: "Up to AED 25M" },
];
const STATUS = [
  { value: "", label: "Ready or off-plan" },
  { value: "Ready", label: "Ready now" },
  { value: "Off-plan", label: "Off-plan" },
];

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-2 tablet:flex-none">
      <span className={cn(LABEL, "text-ink/50")}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full cursor-pointer appearance-none border border-dashed bg-transparent bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path d=%22M2 4l4 4 4-4%22 fill=%22none%22 stroke=%22%234f4742%22 stroke-width=%221.25%22/></svg>')] bg-[length:12px] bg-[position:right_12px_center] bg-no-repeat pl-3 pr-8 font-inter text-[14px] font-medium text-ink outline-none transition-colors hover:border-[var(--color-gold-ink)] focus:border-solid focus:border-[var(--color-gold)] tablet:w-[190px]"
        style={{ borderColor: LINE }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PropertiesBrowser({ category }: { category: Category | null }) {
  const content = useSiteContent();
  const enquiry = useEnquiry();
  const [status, setStatus] = useState("");
  const [beds, setBeds] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [shown, setShown] = useState(PAGE);

  const pool: Property[] = useMemo(() => (category ? propertiesFor(content, category) : CATEGORIES.flatMap((c) => propertiesFor(content, c))), [content, category]);

  const results = useMemo(() => {
    const filtered = pool.filter((p) => {
      if (status && p.status !== status) return false;
      if (maxPrice && p.priceAed > Number(maxPrice)) return false;
      if (beds !== "") {
        if (p.bedrooms === null) return false;
        if (beds === "4") return p.bedrooms >= 4;
        return p.bedrooms === Number(beds);
      }
      return true;
    });
    const by: Record<Sort, (a: Property, b: Property) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order,
      "price-asc": (a, b) => a.priceAed - b.priceAed,
      "price-desc": (a, b) => b.priceAed - a.priceAed,
      "size-desc": (a, b) => b.areaSqft - a.areaSqft,
      newest: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    };
    return [...filtered].sort(by[sort]);
  }, [pool, status, beds, maxPrice, sort]);

  const filtered = !!(status || beds || maxPrice);
  const clear = () => {
    setStatus("");
    setBeds("");
    setMaxPrice("");
    setShown(PAGE);
  };
  const name = (category ?? "properties").toLowerCase();
  const fill = (t: string) => t.replace(/\{category\}/g, name).replace(/\{count\}/g, String(results.length));
  const visible = results.slice(0, shown);

  return (
    <div className="flex w-full flex-col items-center bg-cream pt-24 tablet:pt-28">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-10 px-5 pb-20 tablet:px-10 tablet:pb-28">
        {/* header */}
        <div className="flex flex-col gap-4">
          <FadeUp onMount>
            <p className={LABEL} style={{ color: "var(--color-gold-ink)" }}>{content.listings.eyebrow}</p>
          </FadeUp>
          <TextReveal as="h1" preset="hero-heading" startOnMount delay={0.1} text={category ? `${category}.` : content.listings.heading} className="font-display text-[40px] font-normal uppercase leading-[1.05] tracking-[-0.03em] text-ink tablet:text-[64px] desktop:text-[80px]" />
          <FadeUp onMount delay={0.2}>
            <p className="max-w-[560px] font-inter text-[16px] font-medium leading-[1.5] tracking-[-0.2px] text-ink-2">{content.listings.subtitle}</p>
          </FadeUp>
        </div>

        {/* category: the web address, so a category can be linked */}
        <nav aria-label="Categories" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 tablet:mx-0 tablet:px-0">
          {[{ href: "/properties", label: "All", active: !category }, ...CATEGORIES.map((c) => ({ href: `/properties/${categorySlug(c)}`, label: c, active: category === c }))].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={cn(LABEL, "flex h-11 shrink-0 items-center border px-5 outline-none transition-colors", t.active ? "border-transparent bg-black text-white" : "border-dashed text-ink hover:border-[var(--color-gold-ink)] hover:text-[var(--color-gold-ink)]")}
              style={t.active ? undefined : { borderColor: LINE }}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {/* filters */}
        <div className="flex flex-col gap-5 border-y border-dashed py-6" style={{ borderColor: LINE }}>
          <div className="flex flex-wrap items-end gap-4">
            <Select label="Status" value={status} onChange={(v) => { setStatus(v); setShown(PAGE); }} options={STATUS} />
            <Select label="Bedrooms" value={beds} onChange={(v) => { setBeds(v); setShown(PAGE); }} options={BEDS} />
            <Select label="Budget" value={maxPrice} onChange={(v) => { setMaxPrice(v); setShown(PAGE); }} options={PRICES} />
            <Select label="Order" value={sort} onChange={(v) => setSort(v as Sort)} options={SORTS} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className={cn(LABEL, "text-ink/55")} aria-live="polite">
              {results.length} {results.length === 1 ? "property" : "properties"}
              {category ? ` in ${name}` : ""}
            </p>
            {filtered && (
              <button type="button" onClick={clear} className={cn(LABEL, "hit-slop cursor-pointer py-1 outline-none transition-colors hover:text-[var(--color-gold-ink)]")} style={{ color: "var(--color-ink-2)" }}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* grid: the listings, then the enquiry panel */}
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3 desktop:gap-6">
          {visible.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: Math.min(i, 5) * 0.06, ease: EASE }}>
              <PropertyCard property={p} layout="grid" sizes="(min-width: 1200px) 420px, (min-width: 810px) 45vw, 90vw" />
            </motion.div>
          ))}
          <motion.div className="min-h-[300px]" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.8, delay: 0.1, ease: EASE }}>
            <EnquiryPanel
              title={results.length ? fill(content.categories.enquiry.title) : "Let us go and find it"}
              text={results.length ? fill(content.categories.enquiry.text) : content.listings.empty}
              label={fill(content.categories.enquiry.cta)}
              onClick={() => enquiry.open(category ?? "Properties")}
            />
          </motion.div>
        </div>

        {shown < results.length && (
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE)}
            className={cn(LABEL, "mx-auto flex h-12 cursor-pointer items-center gap-3 border border-dashed px-8 text-ink outline-none transition-colors hover:border-[var(--color-gold-ink)] hover:text-[var(--color-gold-ink)]")}
            style={{ borderColor: LINE }}
          >
            Show more
            <span aria-hidden className="text-[16px] leading-none">↓</span>
            <span className="text-ink/45">{results.length - shown} left</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default PropertiesBrowser;
