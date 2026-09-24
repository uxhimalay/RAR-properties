"use client";

import type { EditorProps } from "@/components/admin/AdminApp";
import { Card, Field, ListEditor, Select, TextInput } from "@/components/admin/ui";

const SOCIAL_KINDS = [
  { value: "InstagramLogo", label: "Instagram" },
  { value: "LinkedinLogo", label: "LinkedIn" },
  { value: "XLogo", label: "X" },
] as const;

export function FooterEditor({ content, update }: EditorProps) {
  const f = content.footer;
  const k = content.contact;
  const setF = (patch: Partial<typeof f>) => update((c) => ({ ...c, footer: { ...c.footer, ...patch } }));
  const setK = (patch: Partial<typeof k>) => update((c) => ({ ...c, contact: { ...c.contact, ...patch } }));
  return (
    <>
      <Card title="How to reach you" hint="Used by the footer, the enquiry drawer and every call and WhatsApp link on the page.">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Phone" hint="With country code, e.g. +971 4 000 0000"><TextInput value={k.phone} onChange={(v) => setK({ phone: v })} /></Field>
          <Field label="WhatsApp number"><TextInput value={k.whatsapp} onChange={(v) => setK({ whatsapp: v })} /></Field>
          <Field label="Email"><TextInput type="email" value={k.email} onChange={(v) => setK({ email: v })} /></Field>
          <Field label="Office hours"><TextInput value={k.hours} onChange={(v) => setK({ hours: v })} /></Field>
        </div>
        <Field label="Address"><TextInput value={k.address} onChange={(v) => setK({ address: v })} /></Field>
      </Card>
      <Card title="Social links" hint="Shown in the menu and the footer.">
        <ListEditor
          items={k.socials}
          onChange={(socials) => setK({ socials })}
          add={() => ({ name: "InstagramLogo", label: "Instagram", href: "https://" })}
          addLabel="Add a link"
          max={5}
          render={(s, upd) => (
            <div className="grid grid-cols-1 gap-3 tablet:grid-cols-[160px_1fr_1fr]">
              <Select value={s.name} onChange={(name) => upd({ ...s, name, label: SOCIAL_KINDS.find((x) => x.value === name)?.label ?? s.label })} options={SOCIAL_KINDS} />
              <TextInput value={s.label} onChange={(label) => upd({ ...s, label })} placeholder="Label" />
              <TextInput value={s.href} onChange={(href) => upd({ ...s, href })} placeholder="https://" />
            </div>
          )}
        />
      </Card>
      <Card title="Footer lines">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <Field label="Collab line" hint="Plain part"><TextInput value={f.collab.text} onChange={(v) => setF({ collab: { ...f.collab, text: v } })} /></Field>
          <Field label="Collab line" hint="Italic part"><TextInput value={f.collab.italic} onChange={(v) => setF({ collab: { ...f.collab, italic: v } })} /></Field>
          <Field label="Marquee phrase"><TextInput value={f.marquee} onChange={(v) => setF({ marquee: v })} /></Field>
          <Field label="Outlined word"><TextInput value={f.outline} onChange={(v) => setF({ outline: v })} /></Field>
        </div>
        <Field label="Copyright"><TextInput value={f.copyright} onChange={(v) => setF({ copyright: v })} /></Field>
      </Card>
    </>
  );
}
