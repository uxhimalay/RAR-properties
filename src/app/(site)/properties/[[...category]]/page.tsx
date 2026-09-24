import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readContent } from "@/lib/cms/store";
import { categoryFromSlug, propertiesFor, CATEGORIES } from "@/lib/cms/schema";
import { Navbar } from "@/components/sections/Navbar";
import { PropertiesBrowser } from "@/components/sections/PropertiesBrowser";
import { SiteFooter } from "@/components/sections/SiteFooter";

/** Rendered at request time, so a listing added in the admin is here on the next load. */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ category?: string[] }> };

/** `/properties` and `/properties/<category>`; anything else is a 404. */
async function resolve(params: Params["params"]) {
  const { category = [] } = await params;
  if (category.length > 1) return { bad: true as const };
  if (category.length === 0) return { bad: false as const, category: null };
  const found = categoryFromSlug(category[0]);
  return found ? { bad: false as const, category: found } : { bad: true as const };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await resolve(params);
  if (r.bad) return { title: "Properties — RAR" };
  const content = await readContent();
  const count = r.category ? propertiesFor(content, r.category).length : CATEGORIES.reduce((n, c) => n + propertiesFor(content, c).length, 0);
  const what = r.category ? r.category.toLowerCase() : "properties";
  return {
    title: r.category ? `${r.category} in Dubai — RAR` : "Properties in Dubai — RAR",
    description: `${count} ${what} on our books: apartments, villas, offices and warehouses across Dubai, with prices, sizes and handover dates.`,
  };
}

export default async function PropertiesPage({ params }: Params) {
  const r = await resolve(params);
  if (r.bad) notFound();
  return (
    <main id="top" className="flex w-full flex-col items-center overflow-clip bg-cream">
      <Navbar solid />
      <PropertiesBrowser category={r.category} />
      <SiteFooter />
    </main>
  );
}
