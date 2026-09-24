"use client";

import type { EditorProps } from "@/components/admin/AdminApp";
import { findProperty, pricePerSqft } from "@/lib/cms/schema";
import { Button, Card, Field, ListEditor, NumberInput, Select, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { ImageSlot } from "@/components/admin/MediaPicker";

export function DealsEditor({ content, update, setMedia }: EditorProps) {
  const d = content.deals;
  const set = (patch: Partial<typeof d>) => update((c) => ({ ...c, deals: { ...c.deals, ...patch } }));
  const setBooking = (patch: Partial<typeof d.booking>) => set({ booking: { ...d.booking, ...patch } });
  const live = content.properties.filter((p) => !p.archived);
  const property = findProperty(content, d.propertyId);
  const derivedTitle = property ? `From AED ${pricePerSqft(property).toLocaleString("en-US")} per sq ft` : "Launch pricing";
  return (
    <>
      <Card title="Header">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Eyebrow"><TextInput value={d.eyebrow} onChange={(v) => set({ eyebrow: v })} /></Field>
          <Field label="Heading"><TextInput value={d.heading} onChange={(v) => set({ heading: v })} /></Field>
        </div>
      </Card>
      <Card title="The property on offer" hint="Its cover photo fills the first cell, its price sets the price card and its photos fill the room row, unless you override them below.">
        <Field label="Property">
          <Select value={d.propertyId ?? ""} onChange={(v) => set({ propertyId: v || null })} options={[{ value: "", label: "None" }, ...live.map((p) => ({ value: p.id, label: `${p.name} · ${p.community}` }))]} />
        </Field>
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-[240px_1fr]">
          <ImageSlot label="Photo (override)" value={d.photoOverride} onChange={(src) => set({ photoOverride: src })} media={content.media} onUploaded={setMedia} allowEmpty aspect="aspect-[4/3]" />
          <p className="font-inter text-[13px] font-medium leading-5 text-[var(--color-ink-2)]">Leave empty to show the property&rsquo;s cover photo{property ? ` (${property.images[0]?.split("/").pop() ?? "none"})` : ""}.</p>
        </div>
      </Card>
      <Card title="Card 01 · Book a visit">
        <Field label="Title"><TextInput value={d.visit.title} onChange={(v) => set({ visit: { ...d.visit, title: v } })} /></Field>
        <Field label="Text"><TextArea value={d.visit.description} onChange={(v) => set({ visit: { ...d.visit, description: v } })} /></Field>
      </Card>
      <Card title="Card 02 · Price">
        <Toggle checked={d.pricing.title === null} onChange={(auto) => set({ pricing: { ...d.pricing, title: auto ? null : derivedTitle } })} label="Work the title out from the property" hint={`Currently: ${d.pricing.title ?? derivedTitle}`} />
        {d.pricing.title !== null && <Field label="Title"><TextInput value={d.pricing.title} onChange={(v) => set({ pricing: { ...d.pricing, title: v } })} /></Field>}
        <Field label="Text"><TextArea value={d.pricing.description} onChange={(v) => set({ pricing: { ...d.pricing, description: v } })} rows={2} /></Field>
        <Field label="Unit sizes under the ruler" hint="Six short figures, smallest to largest, e.g. 1.2k">
          <div className="grid grid-cols-3 gap-2 tablet:grid-cols-6">
            {d.pricing.sizes.map((s, i) => (
              <TextInput key={i} value={s} onChange={(v) => set({ pricing: { ...d.pricing, sizes: d.pricing.sizes.map((x, k) => (k === i ? v : x)) } })} />
            ))}
          </div>
        </Field>
      </Card>
      <Card title="Room photos" hint="The click row in the wide cell: 3 or 4 photos by width. Defaults to the property's photos.">
        <Toggle checked={d.gallery === null} onChange={(auto) => set({ gallery: auto ? null : (property?.images ?? []).map((src) => ({ src, alt: "", title: property?.name ?? "" })) })} label="Use the property's photos" />
        {d.gallery !== null && (
          <ListEditor
            items={d.gallery}
            onChange={(gallery) => set({ gallery })}
            add={() => ({ src: content.media.find((m) => !m.archived)?.src ?? "", alt: "", title: "" })}
            addLabel="Add a room"
            max={6}
            render={(g, upd) => (
              <div className="flex items-start gap-4">
                <div className="w-[120px] shrink-0"><ImageSlot value={g.src || null} onChange={(src) => src && upd({ ...g, src })} media={content.media} onUploaded={setMedia} aspect="aspect-square" /></div>
                <Field label="Room" className="flex-1"><TextInput value={g.title} onChange={(v) => upd({ ...g, title: v })} placeholder="Master bedroom" /></Field>
              </div>
            )}
          />
        )}
      </Card>
      <Card title="Booking calendar" hint="Times are in the property's zone. A time closer than the notice is not offered.">
        <Field label="Visit times" hint="24-hour, e.g. 10:00">
          <ListEditor items={d.booking.slots} onChange={(slots) => setBooking({ slots })} add={() => "12:00"} addLabel="Add a time" max={8} render={(t, upd) => <TextInput value={t} onChange={(v) => upd(v.replace(/[^\d:]/g, "").slice(0, 5))} placeholder="HH:MM" className="w-[120px]" />} />
        </Field>
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
          <Field label="Notice (minutes)"><NumberInput value={d.booking.leadMinutes} onChange={(v) => setBooking({ leadMinutes: v ?? 0 })} min={0} step={15} /></Field>
          <Field label="Months ahead"><NumberInput value={d.booking.monthsAhead} onChange={(v) => setBooking({ monthsAhead: v ?? 1 })} min={1} /></Field>
          <Field label="Visit length (min)"><NumberInput value={d.booking.durationMinutes} onChange={(v) => setBooking({ durationMinutes: v ?? 30 })} min={15} step={15} /></Field>
          <Field label="Zone offset (min)" hint="Dubai is +240"><NumberInput value={d.booking.utcOffsetMinutes} onChange={(v) => setBooking({ utcOffsetMinutes: v ?? 0 })} step={30} /></Field>
        </div>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Zone label"><TextInput value={d.booking.timezoneLabel} onChange={(v) => setBooking({ timezoneLabel: v })} /></Field>
          <Field label="Where the visit happens"><TextInput value={d.booking.place} onChange={(v) => setBooking({ place: v })} /></Field>
        </div>
        <Button onClick={() => setBooking({ slots: ["10:00", "11:30", "14:00", "16:30"], leadMinutes: 60, monthsAhead: 6, durationMinutes: 45 })} className="self-start">Reset times to the defaults</Button>
      </Card>
    </>
  );
}
