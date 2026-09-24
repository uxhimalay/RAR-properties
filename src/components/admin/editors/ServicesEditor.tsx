"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { EditorProps } from "@/components/admin/AdminApp";
import type { ServiceItem } from "@/lib/cms/schema";
import { Button, Card, Field, LABEL, ListEditor, TextArea, TextInput, Thumb } from "@/components/admin/ui";
import { ImageSlot } from "@/components/admin/MediaPicker";

export function ServicesEditor({ content, update, setMedia }: EditorProps) {
  const s = content.services;
  const set = (patch: Partial<typeof s>) => update((c) => ({ ...c, services: { ...c.services, ...patch } }));
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const setItem = (i: number, patch: Partial<ServiceItem>) => set({ items: s.items.map((it, k) => (k === i ? { ...it, ...patch } : it)) });
  return (
    <>
      <Card title="Header">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Eyebrow"><TextInput value={s.eyebrow} onChange={(v) => set({ eyebrow: v })} /></Field>
          <Field label="Card link text"><TextInput value={s.cta} onChange={(v) => set({ cta: v })} /></Field>
        </div>
        <Field label="Heading"><TextInput value={s.heading} onChange={(v) => set({ heading: v })} /></Field>
      </Card>
      <Card title="Service cards" hint="In rail order. Click a card to edit it; the pop-up fields describe the service in full." actions={<Button onClick={() => { set({ items: [...s.items, { category: "New", title: "New service", description: "", image: content.media.find((m) => !m.archived)?.src ?? "", detail: { title: "New service", hours: "Sun - Sat, 9:00 - 19:00", location: "Dubai, UAE", description: "", bullets: [], summary: "", price: "" } }] }); setOpenIndex(s.items.length); }}>+ Add a service</Button>}>
        <div className="flex flex-col gap-3">
          {s.items.map((it, i) => (
            <div key={i} className="border border-dashed" style={{ borderColor: "rgba(79,71,66,0.22)" }}>
              <button type="button" onClick={() => setOpenIndex(openIndex === i ? null : i)} className="flex w-full cursor-pointer items-center gap-4 p-3 text-left outline-none">
                <Thumb src={it.image} className="h-12 w-16 shrink-0" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-display text-[16px]">{String(i + 1).padStart(2, "0")} · {it.title}</span>
                  <span className={cn(LABEL, "text-[var(--color-ink-2)]")}>{it.category}</span>
                </span>
                <span className={cn(LABEL, "text-[var(--color-gold-ink)]")}>{openIndex === i ? "Close" : "Edit"}</span>
              </button>
              {openIndex === i && (
                <div className="flex flex-col gap-4 border-t border-dashed p-4" style={{ borderColor: "rgba(79,71,66,0.22)" }}>
                  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-[200px_1fr]">
                    <ImageSlot label="Pop-up photo" value={it.image || null} onChange={(src) => src && setItem(i, { image: src })} media={content.media} onUploaded={setMedia} aspect="aspect-[4/3]" />
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                        <Field label="Category word (top right)"><TextInput value={it.category} onChange={(v) => setItem(i, { category: v })} /></Field>
                        <Field label="Title"><TextInput value={it.title} onChange={(v) => setItem(i, { title: v, detail: { ...it.detail, title: v } })} /></Field>
                      </div>
                      <Field label="Card text"><TextArea value={it.description} onChange={(v) => setItem(i, { description: v })} rows={2} /></Field>
                    </div>
                  </div>
                  <Field label="Pop-up description"><TextArea value={it.detail.description} onChange={(v) => setItem(i, { detail: { ...it.detail, description: v } })} rows={2} /></Field>
                  <Field label="What is included">
                    <ListEditor items={it.detail.bullets} onChange={(bullets) => setItem(i, { detail: { ...it.detail, bullets } })} add={() => "New point"} addLabel="Add a point" render={(b, upd) => <TextInput value={b} onChange={upd} />} />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                    <Field label="Summary line"><TextInput value={it.detail.summary} onChange={(v) => setItem(i, { detail: { ...it.detail, summary: v } })} /></Field>
                    <Field label="Price line" hint="e.g. Free consultation, 5% of annual rent"><TextInput value={it.detail.price} onChange={(v) => setItem(i, { detail: { ...it.detail, price: v } })} /></Field>
                    <Field label="Hours"><TextInput value={it.detail.hours} onChange={(v) => setItem(i, { detail: { ...it.detail, hours: v } })} /></Field>
                    <Field label="Location"><TextInput value={it.detail.location} onChange={(v) => setItem(i, { detail: { ...it.detail, location: v } })} /></Field>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => { if (i > 0) set({ items: s.items.map((x, k) => (k === i - 1 ? s.items[i] : k === i ? s.items[i - 1] : x)) }); setOpenIndex(i - 1); }} disabled={i === 0}>Move up</Button>
                    <Button onClick={() => { if (i < s.items.length - 1) set({ items: s.items.map((x, k) => (k === i + 1 ? s.items[i] : k === i ? s.items[i + 1] : x)) }); setOpenIndex(i + 1); }} disabled={i === s.items.length - 1}>Move down</Button>
                    <Button variant="danger" onClick={() => { set({ items: s.items.filter((_, k) => k !== i) }); setOpenIndex(null); }} disabled={s.items.length <= 1}>Remove</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
