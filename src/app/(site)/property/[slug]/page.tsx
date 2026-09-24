import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readContent } from "@/lib/cms/store";
import { findProperty, priceLabel } from "@/lib/cms/schema";
import { Navbar } from "@/components/sections/Navbar";
import { PropertyDetail } from "@/components/sections/PropertyDetail";
import { SiteFooter } from "@/components/sections/SiteFooter";

/** Rendered at request time so a change in the admin is live on the next load. */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const property = findProperty(await readContent(), slug);
  if (!property || property.archived) return { title: "Property — RAR" };
  return {
    title: `${property.name}, ${property.community} — RAR`,
    description: `${property.type} in ${property.community}, ${priceLabel(property.priceAed)}. ${property.description}`,
    openGraph: { images: property.images[0] ? [{ url: property.images[0] }] : undefined },
  };
}

export default async function PropertyPage({ params }: Params) {
  const { slug } = await params;
  const property = findProperty(await readContent(), slug);
  if (!property || property.archived) notFound();
  return (
    <main id="top" className="flex w-full flex-col items-center overflow-clip bg-cream">
      <Navbar />
      <PropertyDetail property={property} />
      <SiteFooter />
    </main>
  );
}
