"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/lib/cms/schema";
import { Button, LABEL, LINE, Thumb, TextInput } from "@/components/admin/ui";

/* ------------------------------------------------------------------------------------------------
 * Choosing a photo anywhere in the admin: a dialog with the library (archived photos hidden), a
 * search box and an upload button. Picking returns the src.
 * ---------------------------------------------------------------------------------------------- */

export async function uploadFiles(files: FileList | File[], alt = ""): Promise<{ added: MediaItem[]; media: MediaItem[] }> {
  const form = new FormData();
  [...files].forEach((f) => form.append("file", f));
  if (alt) form.append("alt", alt);
  const res = await fetch("/api/cms/upload", { method: "POST", body: form });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Upload failed");
  return res.json();
}

export function MediaPicker({ media, onPick, onClose, onUploaded, title = "Choose a photo" }: { media: MediaItem[]; onPick: (src: string) => void; onClose: () => void; onUploaded: (media: MediaItem[]) => void; title?: string }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const live = media.filter((m) => !m.archived && !/\.(mp4|webm)$/i.test(m.src) && (!q || m.alt.toLowerCase().includes(q.toLowerCase()) || m.src.toLowerCase().includes(q.toLowerCase())));
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const r = await uploadFiles(files);
      onUploaded(r.media);
      if (r.added[0]) onPick(r.added[0].src);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="flex max-h-[86vh] w-full max-w-[920px] flex-col gap-5 border border-dashed bg-white p-6" style={{ borderColor: LINE }} onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[20px] font-normal tracking-[-0.01em]">{title}</h2>
          <div className="flex items-center gap-2">
            <TextInput value={q} onChange={setQ} placeholder="Search photos" className="w-[220px]" />
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
            <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={busy}>{busy ? "Uploading…" : "Upload"}</Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
        {error && <p role="alert" className="font-inter text-[13px] font-medium text-[#a2432d]">{error}</p>}
        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto tablet:grid-cols-5">
          {live.map((m) => (
            <button key={m.src} type="button" onClick={() => onPick(m.src)} className="group flex cursor-pointer flex-col gap-2 text-left outline-none">
              <Thumb src={m.src} alt={m.alt} className="aspect-square w-full transition-shadow group-hover:shadow-[inset_0_0_0_2px_var(--color-gold)] group-focus-visible:shadow-[inset_0_0_0_2px_var(--color-gold)]" />
              <span className={cn(LABEL, "truncate text-[var(--color-ink-2)]")}>{m.alt || m.src.split("/").pop()}</span>
            </button>
          ))}
          {live.length === 0 && <p className="col-span-full font-inter text-[13px] font-medium text-[rgba(79,71,66,0.6)]">No photos match. Upload one.</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** One photo slot in a form: thumbnail, change, clear. */
export function ImageSlot({ value, onChange, media, onUploaded, label, aspect = "aspect-[4/3]", allowEmpty = false }: { value: string | null; onChange: (src: string | null) => void; media: MediaItem[]; onUploaded: (media: MediaItem[]) => void; label?: string; aspect?: string; allowEmpty?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      {label && <span className={cn(LABEL, "text-[var(--color-ink-2)]")}>{label}</span>}
      <button type="button" onClick={() => setOpen(true)} className="group block w-full cursor-pointer text-left outline-none">
        <Thumb src={value} className={cn(aspect, "w-full transition-shadow group-hover:shadow-[inset_0_0_0_2px_var(--color-gold)] group-focus-visible:shadow-[inset_0_0_0_2px_var(--color-gold)]")} sizes="400px" />
      </button>
      <div className="flex items-center gap-2">
        <Button onClick={() => setOpen(true)} className="h-8 px-3">{value ? "Change" : "Choose"}</Button>
        {value && allowEmpty && <Button onClick={() => onChange(null)} className="h-8 px-3">Clear</Button>}
        {value && <span className={cn(LABEL, "truncate text-[rgba(79,71,66,0.5)]")}>{value.split("/").pop()}</span>}
      </div>
      {open && <MediaPicker media={media} onPick={(src) => { onChange(src); setOpen(false); }} onClose={() => setOpen(false)} onUploaded={onUploaded} />}
    </div>
  );
}
