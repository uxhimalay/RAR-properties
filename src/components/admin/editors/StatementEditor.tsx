"use client";

import type { EditorProps } from "@/components/admin/AdminApp";
import { Card, Field, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { ImageSlot } from "@/components/admin/MediaPicker";

export function StatementEditor({ content, update, setMedia }: EditorProps) {
  const s = content.statement;
  const set = (patch: Partial<typeof s>) => update((c) => ({ ...c, statement: { ...c.statement, ...patch } }));
  return (
    <>
      <Card title="The statement" hint="A full screen: one word set huge behind a portrait, a heading over it, and a short paragraph with two links. The word and the portrait drift apart as a visitor scrolls through.">
        <Toggle checked={s.enabled} onChange={(enabled) => set({ enabled })} label="Show this section" hint="Off removes the whole section from the page." />
      </Card>

      <Card title="The heading" hint="Three parts. The middle one is set in italic serif and picks up the gold; the other two are the heavy sans.">
        <Field label="Before the italic"><TextInput value={s.heading.lead} onChange={(v) => set({ heading: { ...s.heading, lead: v } })} /></Field>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="The italic words" hint="Two or three words read best."><TextInput value={s.heading.italic} onChange={(v) => set({ heading: { ...s.heading, italic: v } })} /></Field>
          <Field label="After the italic"><TextInput value={s.heading.tail} onChange={(v) => set({ heading: { ...s.heading, tail: v } })} /></Field>
        </div>
      </Card>

      <Card title="The word behind" hint="Set to about a fifth of the screen's width and kept to one line, so a short word carries best.">
        <Field label="The word"><TextInput value={s.word} onChange={(v) => set({ word: v })} /></Field>
      </Card>

      <Card title="The paragraph and the links">
        <Field label="Paragraph"><TextArea value={s.paragraph} onChange={(v) => set({ paragraph: v })} rows={3} /></Field>
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Underlined link"><TextInput value={s.cta.label} onChange={(v) => set({ cta: { ...s.cta, label: v } })} /></Field>
          <Field label="Goes to" hint="A section on this page, e.g. #work, or an address."><TextInput value={s.cta.href} onChange={(v) => set({ cta: { ...s.cta, href: v } })} /></Field>
          <Field label="Quieter link"><TextInput value={s.secondary.label} onChange={(v) => set({ secondary: { ...s.secondary, label: v } })} /></Field>
          <Field label="Goes to"><TextInput value={s.secondary.href} onChange={(v) => set({ secondary: { ...s.secondary, href: v } })} /></Field>
        </div>
      </Card>

      <Card title="The portrait" hint="Stands in the middle of the section and fades out towards the bottom. A cut-out on a transparent background reads best against the black.">
        <div className="max-w-[320px]">
          <ImageSlot value={s.image || null} onChange={(image) => image && set({ image })} media={content.media} onUploaded={setMedia} aspect="aspect-[1850/1720]" />
        </div>
      </Card>
    </>
  );
}

export default StatementEditor;
