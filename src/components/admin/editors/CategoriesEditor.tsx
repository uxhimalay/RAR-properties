"use client";

import Link from "next/link";
import type { EditorProps } from "@/components/admin/AdminApp";
import { CATEGORIES, propertiesFor } from "@/lib/cms/schema";
import { Card, Field, TextArea, TextInput, Thumb } from "@/components/admin/ui";

export function CategoriesEditor({ content, update }: EditorProps) {
  const c = content.categories;
  const set = (patch: Partial<typeof c>) => update((d) => ({ ...d, categories: { ...d.categories, ...patch } }));
  return (
    <>
      <Card title="Header">
        <Field label="Eyebrow"><TextInput value={c.eyebrow} onChange={(v) => set({ eyebrow: v })} /></Field>
        <Field label="Heading"><TextInput value={c.heading} onChange={(v) => set({ heading: v })} /></Field>
      </Card>
      <Card title="The enquiry panel" hint="Ends every row, and grows to fill the space when a category has fewer listings. Write {category} where the open tab's name should appear.">
        <Field label="Title"><TextInput value={c.enquiry.title} onChange={(v) => set({ enquiry: { ...c.enquiry, title: v } })} /></Field>
        <Field label="Text"><TextArea value={c.enquiry.text} onChange={(v) => set({ enquiry: { ...c.enquiry, text: v } })} rows={2} /></Field>
        <Field label="Link"><TextInput value={c.enquiry.cta} onChange={(v) => set({ enquiry: { ...c.enquiry, cta: v } })} /></Field>
      </Card>
      <Card title="The link to every listing" hint="Sits beside the tabs and opens the listings page. Write {count} and {category} where the number and the tab's name should appear.">
        <Field label="Label"><TextInput value={c.viewAll} onChange={(v) => set({ viewAll: v })} /></Field>
      </Card>
      <Card title="The listings page" hint="What /properties says above its filters.">
        <Field label="Eyebrow"><TextInput value={content.listings.eyebrow} onChange={(v) => update((d) => ({ ...d, listings: { ...d.listings, eyebrow: v } }))} /></Field>
        <Field label="Heading"><TextInput value={content.listings.heading} onChange={(v) => update((d) => ({ ...d, listings: { ...d.listings, heading: v } }))} /></Field>
        <Field label="Subtitle"><TextArea value={content.listings.subtitle} onChange={(v) => update((d) => ({ ...d, listings: { ...d.listings, subtitle: v } }))} rows={2} /></Field>
        <Field label="When nothing matches"><TextArea value={content.listings.empty} onChange={(v) => update((d) => ({ ...d, listings: { ...d.listings, empty: v } }))} rows={2} /></Field>
      </Card>
      <Card title="What each tab shows" hint="Cards are your live properties in that category, featured ones first. Edit them under Properties.">
        <div className="flex flex-col gap-6">
          {CATEGORIES.map((cat) => {
            const list = propertiesFor(content, cat);
            return (
              <div key={cat} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[16px]">{cat}</h3>
                  <Link href={`/admin/properties?category=${cat}`} className="font-inter text-[11px] font-medium uppercase tracking-[0.44px] text-[var(--color-gold-ink)] outline-none">Manage</Link>
                </div>
                {list.length === 0 ? (
                  <p className="font-inter text-[13px] font-medium text-[#a2432d]">No live properties: this tab shows only the enquiry card. <Link href="/admin/properties/new" className="text-[var(--color-gold-ink)]">Add one.</Link></p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {list.map((p) => (
                      <Link key={p.id} href={`/admin/properties/${p.id}`} className="flex w-[140px] shrink-0 flex-col gap-2 outline-none">
                        <Thumb src={p.images[0]} className="aspect-[13/15] w-full" />
                        <span className="truncate font-inter text-[12px] font-medium">{p.featured ? "★ " : ""}{p.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
