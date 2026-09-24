"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { EditorProps } from "@/components/admin/AdminApp";
import { priceLabel, sqftLabel, type Property } from "@/lib/cms/schema";
import { AI_DEFAULT_MODELS, AI_LABELS, aiMap, mapColumns, normalizeProperty, parseDelimited, type AiProvider } from "@/lib/cms/import";
import { Button, Card, Field, LABEL, LINE, Select, TextArea, TextInput, useLocalState } from "@/components/admin/ui";

const SAMPLE = `Name,Community,Type,Status,Price,Size,Beds,Baths,Units,Handover,Developer,Images,Highlights,Description
Marina Gate Two-Bed,Dubai Marina,Apartment,Ready,AED 3.1M,"1,520 sq ft",2,3,2,Ready,Select Group,/images/deals-bedroom.jpg;/images/hero-side-living.jpg,Sea view;Two parking bays,A bright corner unit on a high floor.
Sobha Hartland Villa,MBR City,Villa,Off-plan,12.5M,"6,200",5,6,3,Q2 2028,Sobha,/images/deals-pool-terrace.jpg,Private pool;Lagoon view,A five-bedroom on the lagoon with handover in 2028.`;

type Row = { property: Property; issues: string[]; exists: boolean };

export function ImportPage({ content, update, save, notify }: EditorProps) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"columns" | "ai">("columns");
  const [provider, setProvider] = useLocalState<AiProvider>("arc_admin_ai_provider", "openai");
  const [keys, setKeys] = useLocalState<Record<string, string>>("arc_admin_ai_keys", {});
  const [model, setModel] = useLocalState<Record<string, string>>("arc_admin_ai_models", {});
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mapping, setMapping] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sheet = useMemo(() => (text.trim() ? parseDelimited(text) : null), [text]);
  const bySlug = useMemo(() => new Map(content.properties.map((p) => [p.slug, p])), [content.properties]);

  const toRows = (records: Record<string, unknown>[]) =>
    records.map((rec) => {
      const first = normalizeProperty(rec);
      const existing = bySlug.get(first.property.slug);
      const { property, issues } = existing ? normalizeProperty(rec, existing) : first;
      return { property, issues, exists: !!existing };
    });

  const preview = async () => {
    if (!sheet || !sheet.rows.length) return setError("Paste a sheet with a heading row and at least one property.");
    setError(null);
    setBusy(true);
    try {
      if (mode === "columns") {
        const { records, mapping: m } = mapColumns(sheet);
        setMapping(sheet.headers.map((h, i) => (m[i] ? `${h} → ${m[i]}` : `${h} → (ignored)`)));
        setRows(toRows(records));
      } else {
        const records = await aiMap(text, provider, keys[provider] ?? "", model[provider] || AI_DEFAULT_MODELS[provider]);
        setMapping(null);
        setRows(toRows(records));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the sheet");
      setRows(null);
    } finally {
      setBusy(false);
    }
  };

  const doImport = async () => {
    if (!rows?.length) return;
    const ready = rows.filter((r) => r.property.name);
    const next = { ...content, properties: [...content.properties] };
    for (const r of ready) {
      const i = next.properties.findIndex((p) => p.id === r.property.id);
      if (i >= 0) next.properties[i] = r.property;
      else next.properties.push(r.property);
    }
    update(() => next);
    const ok = await save(next);
    if (ok) {
      notify(`${ready.length} propert${ready.length === 1 ? "y" : "ies"} imported and saved`);
      setRows(null);
      setText("");
    }
  };

  return (
    <>
      <Card title="1 · The sheet" hint="Copy the cells from Excel or Google Sheets (with the heading row) and paste, or pick a CSV file.">
        <TextArea value={text} onChange={setText} rows={8} placeholder={"Name, Community, Type, Price, Size, Beds…"} className="font-mono text-[12px]" />
        <div className="flex flex-wrap items-center gap-3">
          <label className={cn(LABEL, "cursor-pointer border border-dashed px-4 py-3 text-[var(--color-ink)] hover:border-[var(--color-gold-ink)]")} style={{ borderColor: LINE }}>
            Pick a CSV file
            <input type="file" accept=".csv,.tsv,.txt,text/csv" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setText(await f.text()); }} />
          </label>
          <Button onClick={() => setText(SAMPLE)}>Use the example</Button>
          {sheet && <span className={cn(LABEL, "text-[var(--color-ink-2)]")}>{sheet.rows.length} row{sheet.rows.length === 1 ? "" : "s"}, {sheet.headers.length} columns</span>}
        </div>
      </Card>

      <Card title="2 · How to read it">
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
          {(["columns", "ai"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={cn("flex cursor-pointer flex-col gap-1 border p-4 text-left outline-none transition-colors", mode === m ? "border-[var(--color-gold-ink)]" : "border-dashed hover:border-[var(--color-gold-ink)]")} style={mode === m ? undefined : { borderColor: LINE }}>
              <span className="font-display text-[16px]">{m === "columns" ? "Match the columns" : "Let an AI model map it"}</span>
              <span className="font-inter text-[13px] font-medium text-[var(--color-ink-2)]">{m === "columns" ? "Works when your headings are recognisable (price, size, beds…). No key needed." : "Send the sheet to ChatGPT, Gemini or Claude with your own key; it returns the properties in our format."}</span>
            </button>
          ))}
        </div>
        {mode === "ai" && (
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
            <Field label="Provider"><Select value={provider} onChange={setProvider} options={(Object.keys(AI_LABELS) as AiProvider[]).map((p) => ({ value: p, label: AI_LABELS[p] }))} /></Field>
            <Field label="API key" hint="Kept in this browser only. It goes straight to the provider, never to our server."><TextInput type="password" value={keys[provider] ?? ""} onChange={(v) => setKeys({ ...keys, [provider]: v })} placeholder="sk-…" /></Field>
            <Field label="Model"><TextInput value={model[provider] ?? AI_DEFAULT_MODELS[provider]} onChange={(v) => setModel({ ...model, [provider]: v })} /></Field>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={preview} disabled={busy || !text.trim()}>{busy ? (mode === "ai" ? "Asking the model…" : "Reading…") : "Preview"}</Button>
          {error && <p role="alert" className="font-inter text-[13px] font-medium text-[#a2432d]">{error}</p>}
        </div>
        {mapping && (
          <div className="flex flex-wrap gap-2">
            {mapping.map((m) => (
              <span key={m} className={cn(LABEL, "border border-dashed px-2 py-1", m.endsWith("(ignored)") ? "text-[rgba(79,71,66,0.5)]" : "text-[var(--color-ink)]")} style={{ borderColor: LINE }}>{m}</span>
            ))}
          </div>
        )}
      </Card>

      {rows && (
        <Card title={`3 · ${rows.length} propert${rows.length === 1 ? "y" : "ies"} ready`} hint="Nothing is saved until you press Import. Rows with the same web address update the existing property." actions={<Button variant="primary" onClick={doImport} disabled={!rows.some((r) => r.property.name)}>Import & save</Button>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left font-inter text-[13px] font-medium">
              <thead>
                <tr className={cn(LABEL, "text-[var(--color-ink-2)]")}>
                  {["Name", "Community", "Category · type", "Price", "Size", "Beds/baths", "Status", "Photos", "Notes"].map((h) => (
                    <th key={h} className="border-b border-dashed px-2 py-2 font-medium" style={{ borderColor: LINE }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={!r.property.name ? "opacity-50" : ""}>
                    <td className="px-2 py-2">{r.property.name || <i>missing</i>}{r.exists && <span className={cn(LABEL, "ml-2 text-[var(--color-gold-ink)]")}>update</span>}</td>
                    <td className="px-2 py-2">{r.property.community}</td>
                    <td className="px-2 py-2">{r.property.category} · {r.property.type}</td>
                    <td className="px-2 py-2">{r.property.priceAed ? priceLabel(r.property.priceAed) : "—"}</td>
                    <td className="px-2 py-2">{r.property.areaSqft ? sqftLabel(r.property.areaSqft) : "—"}</td>
                    <td className="px-2 py-2">{r.property.bedrooms ?? "—"} / {r.property.bathrooms ?? "—"}</td>
                    <td className="px-2 py-2">{r.property.status}{r.property.status === "Off-plan" ? ` · ${r.property.handover}` : ""}</td>
                    <td className="px-2 py-2">{r.property.images.length}</td>
                    <td className={cn("px-2 py-2", r.issues.length ? "text-[#a2432d]" : "text-[var(--color-ink-2)]")}>{r.issues.join(", ") || "ok"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
