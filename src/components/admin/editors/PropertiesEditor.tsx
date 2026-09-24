"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { EditorProps } from "@/components/admin/AdminApp";
import { CATEGORIES, PROPERTY_TYPES, STATUSES, newId, priceLabel, pricePerSqft, slugify, sqftLabel, type Category, type Property } from "@/lib/cms/schema";
import { Button, Card, Field, LABEL, ListEditor, NumberInput, Select, TextArea, TextInput, Thumb, Toggle } from "@/components/admin/ui";
import { ImageSlot } from "@/components/admin/MediaPicker";

/* ------------------------------------------------------------------------------------------------
 * Properties: the list (search, category filter, live/archived) and the form for one listing.
 * `/admin/properties` lists; `/admin/properties/new` starts a draft; `/admin/properties/<id>` edits.
 * ---------------------------------------------------------------------------------------------- */

export function blankProperty(category: Category = "Residential"): Property {
  return { id: newId("p"), slug: "", name: "", category, community: "", type: category === "Villas" ? "Villa" : category === "Warehouse" ? "Warehouse" : category === "Commercial" ? "Office" : "Apartment", status: "Ready", priceAed: 0, areaSqft: 0, bedrooms: category === "Residential" || category === "Villas" ? 2 : null, bathrooms: 2, unitsAvailable: 1, handover: "Ready", developer: "", images: [], highlights: [], description: "", featured: false, archived: false, order: 99, updatedAt: new Date().toISOString() };
}

export function PropertiesEditor(props: EditorProps) {
  const id = props.path[1];
  if (id === "new") return <PropertyForm {...props} draft />;
  if (id) return <PropertyForm {...props} />;
  return <PropertyList {...props} />;
}

function PropertyList({ content, update }: EditorProps) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(params.get("category") ?? "");
  const [showArchived, setShowArchived] = useState(false);
  const rows = useMemo(
    () =>
      content.properties
        .filter((p) => (showArchived ? true : !p.archived))
        .filter((p) => !cat || p.category === cat)
        .filter((p) => !q || `${p.name} ${p.community} ${p.developer}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => a.category.localeCompare(b.category) || Number(b.featured) - Number(a.featured) || a.order - b.order),
    [content.properties, q, cat, showArchived],
  );
  const toggle = (id: string, patch: Partial<Property>) => update((c) => ({ ...c, properties: c.properties.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)) }));
  return (
    <Card
      title={`${rows.length} ${rows.length === 1 ? "property" : "properties"}`}
      actions={<Button variant="primary" onClick={() => router.push("/admin/properties/new")}>+ New property</Button>}
    >
      <div className="flex flex-wrap items-center gap-3">
        <TextInput value={q} onChange={setQ} placeholder="Search name, community, developer" className="w-[260px]" />
        <Select value={cat} onChange={setCat} options={[{ value: "", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} className="w-[180px]" />
        <label className={cn(LABEL, "flex cursor-pointer items-center gap-2 text-[var(--color-ink-2)]")}>
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-[var(--color-gold-ink)]" /> Show archived
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className={cn(LABEL, "text-[var(--color-ink-2)]")}>
              {["", "Property", "Category", "Price", "Size", "Status", "Featured", "Live", ""].map((h, i) => (
                <th key={i} className="border-b border-dashed px-2 py-2 font-medium" style={{ borderColor: "rgba(79,71,66,0.22)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className={cn("font-inter text-[14px] font-medium", p.archived && "opacity-50")}>
                <td className="px-2 py-2"><Thumb src={p.images[0]} className="h-12 w-16" /></td>
                <td className="px-2 py-2">
                  <Link href={`/admin/properties/${p.id}`} className="flex flex-col outline-none hover:text-[var(--color-gold-ink)]">
                    <span>{p.name || <i className="text-[rgba(79,71,66,0.5)]">Untitled</i>}</span>
                    <span className="text-[12px] text-[var(--color-ink-2)]">{p.community} · {p.type}</span>
                  </Link>
                </td>
                <td className="px-2 py-2">{p.category}</td>
                <td className="px-2 py-2">{priceLabel(p.priceAed)}<span className="block text-[12px] text-[var(--color-ink-2)]">AED {pricePerSqft(p).toLocaleString("en-US")}/sq ft</span></td>
                <td className="px-2 py-2">{sqftLabel(p.areaSqft)}</td>
                <td className="px-2 py-2">{p.status}</td>
                <td className="px-2 py-2"><Toggle checked={p.featured} onChange={(featured) => toggle(p.id, { featured })} label="" /></td>
                <td className="px-2 py-2"><Toggle checked={!p.archived} onChange={(live) => toggle(p.id, { archived: !live })} label="" /></td>
                <td className="px-2 py-2"><Link href={`/admin/properties/${p.id}`} className={cn(LABEL, "text-[var(--color-gold-ink)] outline-none")}>Edit</Link></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-2 py-6 font-inter text-[13px] font-medium text-[rgba(79,71,66,0.6)]">Nothing matches.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PropertyForm({ content, update, setMedia, notify, path, draft }: EditorProps & { draft?: boolean }) {
  const router = useRouter();
  const id = path[1];
  const existing = content.properties.find((p) => p.id === id);
  const [local, setLocal] = useState<Property>(() => existing ?? blankProperty());
  const p = existing ?? local;
  const isDeal = content.deals.propertyId === p.id;
  const otherSlugs = new Set(content.properties.filter((x) => x.id !== p.id).map((x) => x.slug));
  const slugTaken = otherSlugs.has(p.slug);

  const set = (patch: Partial<Property>) => {
    const next = { ...p, ...patch, updatedAt: new Date().toISOString() };
    if (existing) update((c) => ({ ...c, properties: c.properties.map((x) => (x.id === p.id ? next : x)) }));
    else setLocal(next);
  };
  const setName = (name: string) => set({ name, slug: !existing || p.slug === slugify(p.name) ? slugify(name) : p.slug });

  const addDraft = () => {
    if (!p.name.trim()) return notify("Give the property a name first", "error");
    if (slugTaken || !p.slug) return notify("The web address is taken or empty", "error");
    update((c) => ({ ...c, properties: [...c.properties, p] }));
    router.replace(`/admin/properties/${p.id}`);
    notify("Added. Press Save to publish it.");
  };
  const remove = () => {
    if (isDeal) return notify("This is the hot-deal property. Pick another under Hot deals first.", "error");
    if (!confirm(`Delete ${p.name || "this property"}? Archiving is safer.`)) return;
    update((c) => ({ ...c, properties: c.properties.filter((x) => x.id !== p.id) }));
    router.replace("/admin/properties");
  };

  if (!existing && !draft) return <Card title="Not found"><Link href="/admin/properties" className="text-[var(--color-gold-ink)]">Back to the list</Link></Card>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/properties" className={cn(LABEL, "text-[var(--color-ink-2)] outline-none hover:text-[var(--color-gold-ink)]")}>← All properties</Link>
        <div className="flex items-center gap-2">
          {existing && <a href={`/property/${p.slug}`} target="_blank" rel="noreferrer" className={cn(LABEL, "text-[var(--color-ink-2)] outline-none hover:text-[var(--color-gold-ink)]")}>Open its page ↗</a>}
          {!existing && <Button variant="primary" onClick={addDraft}>Add this property</Button>}
          {existing && <Button variant="danger" onClick={remove}>Delete</Button>}
        </div>
      </div>
      <Card title={existing ? p.name || "Untitled" : "New property"} hint="What the card shows, and what its page says.">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Name"><TextInput value={p.name} onChange={setName} placeholder="Marina Residence" /></Field>
          <Field label="Web address" hint={slugTaken ? "Already used by another property" : `/property/${p.slug || "…"}`}><TextInput value={p.slug} onChange={(v) => set({ slug: slugify(v) })} className={slugTaken ? "border-[#a2432d]" : ""} /></Field>
          <Field label="Category"><Select value={p.category} onChange={(category) => set({ category })} options={CATEGORIES} /></Field>
          <Field label="Type"><Select value={p.type} onChange={(type) => set({ type })} options={PROPERTY_TYPES} /></Field>
          <Field label="Community" hint="e.g. Dubai Marina"><TextInput value={p.community} onChange={(v) => set({ community: v })} /></Field>
          <Field label="Developer"><TextInput value={p.developer} onChange={(v) => set({ developer: v })} /></Field>
        </div>
      </Card>
      <Card title="Numbers" hint="Price and size drive the card, the page and the hot-deal price card.">
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
          <Field label="Price (AED)"><NumberInput value={p.priceAed} onChange={(v) => set({ priceAed: v ?? 0 })} min={0} step={1000} /></Field>
          <Field label="Size (sq ft)"><NumberInput value={p.areaSqft} onChange={(v) => set({ areaSqft: v ?? 0 })} min={0} step={10} /></Field>
          <Field label="Price per sq ft"><TextInput value={p.areaSqft ? `AED ${pricePerSqft(p).toLocaleString("en-US")}` : "—"} onChange={() => {}} disabled /></Field>
          <Field label="Units available"><NumberInput value={p.unitsAvailable} onChange={(v) => set({ unitsAvailable: v })} min={0} /></Field>
          <Field label="Bedrooms" hint="0 = studio, empty = not a home"><NumberInput value={p.bedrooms} onChange={(v) => set({ bedrooms: v })} min={0} /></Field>
          <Field label="Bathrooms"><NumberInput value={p.bathrooms} onChange={(v) => set({ bathrooms: v })} min={0} /></Field>
          <Field label="Status"><Select value={p.status} onChange={(status) => set({ status, handover: status === "Ready" ? "Ready" : p.handover === "Ready" ? "" : p.handover })} options={STATUSES} /></Field>
          <Field label="Handover" hint="Ready, or e.g. Q4 2027"><TextInput value={p.handover} onChange={(v) => set({ handover: v })} /></Field>
        </div>
      </Card>
      <Card title="Photos" hint="The first is the cover on the card and the page.">
        <ListEditor
          items={p.images}
          onChange={(images) => set({ images })}
          add={() => content.media.find((m) => !m.archived && !p.images.includes(m.src))?.src ?? ""}
          addLabel="Add a photo"
          max={12}
          render={(src, upd, i) => (
            <div className="flex items-center gap-4">
              <div className="w-[160px] shrink-0"><ImageSlot value={src || null} onChange={(s) => s && upd(s)} media={content.media} onUploaded={setMedia} aspect="aspect-[4/3]" /></div>
              <span className={cn(LABEL, "text-[var(--color-ink-2)]")}>{i === 0 ? "Cover" : `Photo ${i + 1}`}</span>
            </div>
          )}
        />
      </Card>
      <Card title="Words">
        <Field label="Description"><TextArea value={p.description} onChange={(v) => set({ description: v })} rows={3} /></Field>
        <Field label="Highlights" hint="Short points, shown with gold dots.">
          <ListEditor items={p.highlights} onChange={(highlights) => set({ highlights })} add={() => "New highlight"} addLabel="Add a highlight" max={8} render={(h, upd) => <TextInput value={h} onChange={upd} />} />
        </Field>
      </Card>
      <Card title="Visibility">
        <Toggle checked={p.featured} onChange={(featured) => set({ featured })} label="Featured" hint="Featured listings come first in their category." />
        <Toggle checked={!p.archived} onChange={(live) => set({ archived: !live })} label="Live on the site" hint="Off = archived: hidden from the cards and its page, kept here." />
        <Field label="Order within the category" hint="Lower comes first among non-featured."><NumberInput value={p.order} onChange={(v) => set({ order: v ?? 0 })} className="w-[120px]" /></Field>
        {isDeal && <p className="font-inter text-[13px] font-medium text-[var(--color-gold-ink)]">This property is the current hot deal.</p>}
      </Card>
    </>
  );
}
