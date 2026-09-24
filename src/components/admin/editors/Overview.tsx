"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EditorProps } from "@/components/admin/AdminApp";
import { CATEGORIES, findProperty, priceLabel } from "@/lib/cms/schema";
import { Card, LABEL, Thumb } from "@/components/admin/ui";

export function Overview({ content }: EditorProps) {
  const live = content.properties.filter((p) => !p.archived);
  const deal = findProperty(content, content.deals.propertyId);
  const media = content.media.filter((m) => !m.archived).length;
  const partners = content.partners.items.filter((p) => p.enabled && !p.archived).length;
  const stat = (n: string | number, label: string, href: string) => (
    <Link key={label} href={href} className="flex flex-col gap-2 border border-dashed bg-white p-5 outline-none transition-colors hover:border-[var(--color-gold-ink)] focus-visible:border-[var(--color-gold-ink)]" style={{ borderColor: "rgba(79,71,66,0.22)" }}>
      <span className="font-display text-[34px] font-normal leading-none tracking-[-0.02em]">{n}</span>
      <span className={cn(LABEL, "text-[var(--color-ink-2)]")}>{label}</span>
    </Link>
  );
  return (
    <>
      <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
        {stat(live.length, "Live properties", "/admin/properties")}
        {stat(content.properties.length - live.length, "Archived", "/admin/properties")}
        {stat(media, "Photos in the library", "/admin/media")}
        {stat(partners, "Partners on the ribbon", "/admin/partners")}
      </div>
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
        <Card title="Today's hot deal" hint="The property the fourth section is about.">
          {deal ? (
            <Link href={`/admin/deals`} className="flex items-center gap-4 outline-none">
              <Thumb src={content.deals.photoOverride ?? deal.images[0]} className="h-20 w-28 shrink-0" />
              <span className="flex flex-col gap-1">
                <span className="font-display text-[18px]">{deal.name}</span>
                <span className="font-inter text-[13px] font-medium text-[var(--color-ink-2)]">{deal.community} · {priceLabel(deal.priceAed)}</span>
              </span>
            </Link>
          ) : (
            <p className="font-inter text-[13px] font-medium text-[var(--color-ink-2)]">No property chosen. <Link href="/admin/deals" className="text-[var(--color-gold-ink)]">Pick one.</Link></p>
          )}
        </Card>
        <Card title="Properties by category" hint="What each tab on the site has to show.">
          <ul className="flex flex-col">
            {CATEGORIES.map((c) => {
              const n = live.filter((p) => p.category === c).length;
              return (
                <li key={c} className="flex items-center justify-between border-b border-dashed py-2 font-inter text-[14px] font-medium" style={{ borderColor: "rgba(79,71,66,0.22)" }}>
                  <span>{c}</span>
                  <span className={n ? "text-[var(--color-ink)]" : "text-[#a2432d]"}>{n || "none"}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
      <Card title="How this works" hint="A minute's read.">
        <ul className="flex flex-col gap-2 font-inter text-[14px] font-medium leading-6 text-[var(--color-ink)]">
          <li>Each screen on the left edits one section of the home page, in page order. Change what you like, then press <b>Save</b> (or Cmd/Ctrl+S). The site shows it on the next load.</li>
          <li><b>Properties</b> feed the category cards and their pages. Mark a listing <i>featured</i> to put it first; <i>archive</i> it to hide it everywhere without deleting.</li>
          <li><b>Photos</b>: click any photo slot to choose from the library or upload. Archiving a photo hides it from the pickers; it can only be deleted once nothing uses it.</li>
          <li><b>Import from a sheet</b> turns a spreadsheet of listings into properties, with or without an AI model.</li>
        </ul>
        <p className={cn(LABEL, "text-[rgba(79,71,66,0.5)]")}>Last saved {new Date(content.updatedAt).toLocaleString("en-GB")}</p>
      </Card>
    </>
  );
}
