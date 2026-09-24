"use client";

import type { EditorProps } from "@/components/admin/AdminApp";
import { Card, Field, TextArea, TextInput } from "@/components/admin/ui";
import { ImageSlot } from "@/components/admin/MediaPicker";

export function HeroEditor({ content, update, setMedia }: EditorProps) {
  const h = content.hero;
  const set = (patch: Partial<typeof h>) => update((c) => ({ ...c, hero: { ...c.hero, ...patch } }));
  return (
    <>
      <Card title="Words" hint="The headline is two lines; the labels sit to its right.">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Headline, line 1"><TextInput value={h.headline[0]} onChange={(v) => set({ headline: [v, h.headline[1]] })} /></Field>
          <Field label="Headline, line 2"><TextInput value={h.headline[1]} onChange={(v) => set({ headline: [h.headline[0], v] })} /></Field>
          <Field label="Label 1"><TextInput value={h.labels[0]} onChange={(v) => set({ labels: [v, h.labels[1]] })} /></Field>
          <Field label="Label 2"><TextInput value={h.labels[1]} onChange={(v) => set({ labels: [h.labels[0], v] })} /></Field>
        </div>
        <Field label="Introduction"><TextArea value={h.paragraph} onChange={(v) => set({ paragraph: v })} /></Field>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="First link (to the work band)" hint="The destination is fixed."><TextInput value={h.link.label} onChange={(v) => set({ link: { ...h.link, label: v } })} /></Field>
          <Field label="Gold link (to the booking card)"><TextInput value={h.cta.label} onChange={(v) => set({ cta: { ...h.cta, label: v } })} /></Field>
        </div>
      </Card>
      <Card title="Photos" hint="The main photo fills the screen; the two side photos appear when the hero shrinks on scroll.">
        <div className="grid grid-cols-1 gap-5 tablet:grid-cols-3">
          <ImageSlot label="Main photo" value={h.mainImage} onChange={(src) => src && set({ mainImage: src })} media={content.media} onUploaded={setMedia} aspect="aspect-[16/10]" />
          <ImageSlot label="Left photo" value={h.leftImage} onChange={(src) => src && set({ leftImage: src })} media={content.media} onUploaded={setMedia} aspect="aspect-[16/10]" />
          <ImageSlot label="Right photo" value={h.rightImage} onChange={(src) => src && set({ rightImage: src })} media={content.media} onUploaded={setMedia} aspect="aspect-[16/10]" />
        </div>
      </Card>
    </>
  );
}
