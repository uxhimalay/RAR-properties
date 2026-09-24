"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { EditorProps } from "@/components/admin/AdminApp";
import { mediaReferences, type MediaItem } from "@/lib/cms/schema";
import { Button, Card, LABEL, LINE, Select, TextInput, Thumb } from "@/components/admin/ui";
import { uploadFiles } from "@/components/admin/MediaPicker";

type Filter = "live" | "uploads" | "archived" | "unused";

export function MediaLibrary({ content, setMedia, notify }: EditorProps) {
  const [filter, setFilter] = useState<Filter>("live");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refsOf = (src: string) => mediaReferences(content, src);
  const items = content.media.filter((m) => {
    if (filter === "live" && m.archived) return false;
    if (filter === "archived" && !m.archived) return false;
    if (filter === "uploads" && m.source !== "upload") return false;
    if (filter === "unused" && refsOf(m.src).length) return false;
    return !q || m.alt.toLowerCase().includes(q.toLowerCase()) || m.src.toLowerCase().includes(q.toLowerCase());
  });

  const upload = async (files: FileList | File[] | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    try {
      const r = await uploadFiles(files);
      setMedia(r.media);
      notify(`${r.added.length} photo${r.added.length === 1 ? "" : "s"} added`);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setBusy(false);
    }
  };
  const patch = async (m: MediaItem, body: Partial<Pick<MediaItem, "archived" | "alt">>) => {
    const res = await fetch("/api/cms/media", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ src: m.src, ...body }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return notify(data.error ?? "Could not update", "error");
    setMedia(data.media);
  };
  const remove = async (m: MediaItem) => {
    if (!confirm(`Delete ${m.alt || m.src.split("/").pop()} for good?`)) return;
    const res = await fetch("/api/cms/media", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ src: m.src }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return notify(data.error ?? "Could not delete", "error");
    setMedia(data.media);
    notify("Deleted");
  };

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void upload(e.dataTransfer.files); }}
        className={cn("flex flex-col items-center justify-center gap-3 border border-dashed bg-white px-6 py-10 text-center transition-colors", dragging && "border-[var(--color-gold-ink)] bg-[var(--color-gold)]/5")}
        style={{ borderColor: dragging ? "var(--color-gold-ink)" : LINE }}
      >
        <p className="font-display text-[18px]">Drop photos here</p>
        <p className="font-inter text-[13px] font-medium text-[var(--color-ink-2)]">JPG, PNG, WebP or AVIF, up to 25 MB each. They land in the library, ready to pick anywhere.</p>
        <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden" onChange={(e) => void upload(e.target.files)} />
        <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? "Uploading…" : "Choose files"}</Button>
      </div>
      <Card
        title={`${items.length} item${items.length === 1 ? "" : "s"}`}
        actions={
          <div className="flex items-center gap-2">
            <TextInput value={q} onChange={setQ} placeholder="Search" className="w-[200px]" />
            <Select value={filter} onChange={setFilter} options={[{ value: "live", label: "Live" }, { value: "uploads", label: "Uploads" }, { value: "unused", label: "Not used anywhere" }, { value: "archived", label: "Archived" }]} className="w-[180px]" />
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
          {items.map((m) => {
            const refs = refsOf(m.src);
            return (
              <div key={m.src} className={cn("flex flex-col gap-2 border border-dashed p-3", m.archived && "opacity-70")} style={{ borderColor: LINE }}>
                <Thumb src={m.src} alt={m.alt} className="aspect-[4/3] w-full" sizes="300px" />
                <input defaultValue={m.alt} onBlur={(e) => e.target.value !== m.alt && patch(m, { alt: e.target.value })} placeholder="Description" className="h-8 w-full border-b border-dashed bg-transparent font-inter text-[13px] font-medium outline-none focus:border-[var(--color-gold-ink)]" style={{ borderColor: LINE }} aria-label="Description" />
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(LABEL, refs.length ? "text-[var(--color-ink-2)]" : "text-[rgba(79,71,66,0.45)]")} title={refs.join("\n")}>{refs.length ? `Used ${refs.length}×` : "Not used"} · {m.source === "upload" ? "upload" : "built-in"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={() => patch(m, { archived: !m.archived })} className="h-8 flex-1 px-2">{m.archived ? "Unarchive" : "Archive"}</Button>
                  {m.source === "upload" && <Button variant="danger" onClick={() => remove(m)} disabled={refs.length > 0} title={refs.length ? "Still in use" : "Delete the file"} className="h-8 px-2">Delete</Button>}
                </div>
              </div>
            );
          })}
          {items.length === 0 && <p className="col-span-full font-inter text-[13px] font-medium text-[rgba(79,71,66,0.6)]">Nothing here.</p>}
        </div>
      </Card>
    </>
  );
}
