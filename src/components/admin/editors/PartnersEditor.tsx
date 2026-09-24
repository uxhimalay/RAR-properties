"use client";

import type { EditorProps } from "@/components/admin/AdminApp";
import { newId } from "@/lib/cms/schema";
import { Card, Field, ListEditor, TextInput, Toggle } from "@/components/admin/ui";
import { ImageSlot } from "@/components/admin/MediaPicker";

export function PartnersEditor({ content, update, setMedia }: EditorProps) {
  const p = content.partners;
  const set = (patch: Partial<typeof p>) => update((c) => ({ ...c, partners: { ...c.partners, ...patch } }));
  return (
    <>
      <Card title="Ribbon">
        <Toggle checked={p.enabled} onChange={(enabled) => set({ enabled })} label="Show the partners ribbon" hint="Between the services and the invitation to visit." />
        <Field label="Eyebrow"><TextInput value={p.eyebrow} onChange={(v) => set({ eyebrow: v })} /></Field>
      </Card>
      <Card title="Partners" hint="Names drift as wordmarks; add a logo to show it instead. Switch one off to hide it for now, archive to keep it out of the way.">
        <ListEditor
          items={p.items}
          onChange={(items) => set({ items })}
          add={() => ({ id: newId("partner"), name: "New partner", logo: null, enabled: true, archived: false })}
          addLabel="Add a partner"
          render={(it, upd) => (
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-[1fr_180px_180px]">
              <Field label="Name"><TextInput value={it.name} onChange={(v) => upd({ ...it, name: v })} /></Field>
              <div className="flex flex-col justify-end gap-2">
                <Toggle checked={it.enabled} onChange={(enabled) => upd({ ...it, enabled })} label="On the ribbon" />
                <Toggle checked={it.archived} onChange={(archived) => upd({ ...it, archived })} label="Archived" />
              </div>
              <ImageSlot label="Logo (optional)" value={it.logo} onChange={(logo) => upd({ ...it, logo })} media={content.media} onUploaded={setMedia} allowEmpty aspect="aspect-[3/1]" />
            </div>
          )}
        />
      </Card>
    </>
  );
}
