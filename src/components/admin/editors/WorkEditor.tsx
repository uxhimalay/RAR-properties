"use client";

import type { EditorProps } from "@/components/admin/AdminApp";
import { Card, Field, ListEditor, TextInput, Thumb, Toggle } from "@/components/admin/ui";
import { ImageSlot } from "@/components/admin/MediaPicker";

export function WorkEditor({ content, update, setMedia }: EditorProps) {
  const w = content.work;
  const set = (patch: Partial<typeof w>) => update((c) => ({ ...c, work: { ...c.work, ...patch } }));
  return (
    <>
      <Card title="Header">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Eyebrow"><TextInput value={w.eyebrow} onChange={(v) => set({ eyebrow: v })} /></Field>
          <Field label="Link (to the categories)"><TextInput value={w.link.label} onChange={(v) => set({ link: { ...w.link, label: v } })} /></Field>
        </div>
        <Field label="Heading"><TextInput value={w.heading} onChange={(v) => set({ heading: v })} /></Field>
        <Field label="Subtitle"><TextInput value={w.subtitle} onChange={(v) => set({ subtitle: v })} /></Field>
      </Card>
      <Card title="The figure" hint="Sits at the far end of the header line on a wide screen, under the link on a narrow one. It counts up from zero the first time a visitor reaches it.">
        <Toggle checked={w.figure.enabled} onChange={(enabled) => set({ figure: { ...w.figure, enabled } })} label="Show the figure" hint="Off leaves the header as a single column." />
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
          <Field label="Number" hint="Digits only. It is what the count runs up to.">
            <TextInput value={String(w.figure.value)} onChange={(v) => set({ figure: { ...w.figure, value: Math.max(0, Math.round(Number(v.replace(/[^0-9]/g, "")) || 0)) } })} />
          </Field>
          <Field label="After the number" hint="For example + or %. Leave empty for none.">
            <TextInput value={w.figure.suffix} onChange={(v) => set({ figure: { ...w.figure, suffix: v } })} />
          </Field>
          <Field label="Caption" hint="The line under the number.">
            <TextInput value={w.figure.label} onChange={(v) => set({ figure: { ...w.figure, label: v } })} />
          </Field>
        </div>
      </Card>
      <Card title="Marquee photos" hint="The 3D panels, in order. Six to eight work best; every fourth opens itself as it passes the centre.">
        <ListEditor
          items={w.images}
          onChange={(images) => set({ images })}
          add={() => ({ src: content.media.find((m) => !m.archived)?.src ?? "", alt: "" })}
          addLabel="Add a photo"
          render={(img, upd) => (
            <div className="flex items-start gap-4">
              <div className="w-[160px] shrink-0">
                <ImageSlot value={img.src || null} onChange={(src) => src && upd({ ...img, src })} media={content.media} onUploaded={setMedia} aspect="aspect-[13/15]" />
              </div>
              <Field label="Description (for screen readers)" className="flex-1"><TextInput value={img.alt} onChange={(v) => upd({ ...img, alt: v })} /></Field>
            </div>
          )}
        />
      </Card>
      <Card title="Stats ribbon" hint="Short statements that drift below the marquee.">
        <ListEditor items={w.stats} onChange={(stats) => set({ stats })} add={() => "New statement"} addLabel="Add a statement" render={(s, upd) => <TextInput value={s} onChange={upd} />} />
      </Card>
      <Card title="Preview" hint="How the panels read as a strip.">
        <div className="flex gap-2 overflow-x-auto">
          {w.images.map((img, i) => (
            <Thumb key={`${img.src}-${i}`} src={img.src} className="h-24 w-[84px] shrink-0" />
          ))}
        </div>
      </Card>
    </>
  );
}
