"use client";

import type { EditorProps } from "@/components/admin/AdminApp";
import { Card, Field, TextArea, TextInput } from "@/components/admin/ui";
import { ImageSlot } from "@/components/admin/MediaPicker";

export function VisitEditor({ content, update, setMedia }: EditorProps) {
  const v = content.visit;
  const set = (patch: Partial<typeof v>) => update((c) => ({ ...c, visit: { ...c.visit, ...patch } }));
  const images = [...v.images];
  while (images.length < 8) images.push({ src: "", alt: "" });
  return (
    <>
      <Card title="Invitation" hint="Appears once the photos have scattered.">
        <Field label="Heading"><TextInput value={v.heading} onChange={(val) => set({ heading: val })} /></Field>
        <Field label="Line"><TextArea value={v.paragraph} onChange={(val) => set({ paragraph: val })} rows={2} /></Field>
        <Field label="Button (to the booking card)"><TextInput value={v.cta.label} onChange={(val) => set({ cta: { ...v.cta, label: val } })} /></Field>
      </Card>
      <Card title="The eight photos" hint="Stacked in this order; the last one sits on top and is what visitors see first.">
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-4">
          {images.slice(0, 8).map((img, i) => (
            <div key={i} className="flex flex-col gap-2">
              <ImageSlot label={`${i + 1}${i === 7 ? " · on top" : i === 0 ? " · at the bottom" : ""}`} value={img.src || null} onChange={(src) => src && set({ images: images.slice(0, 8).map((x, k) => (k === i ? { ...x, src } : x)).filter((x) => x.src) })} media={content.media} onUploaded={setMedia} aspect="aspect-square" />
              <TextInput value={img.alt} onChange={(alt) => set({ images: images.slice(0, 8).map((x, k) => (k === i ? { ...x, alt } : x)).filter((x) => x.src) })} placeholder="Description" />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
