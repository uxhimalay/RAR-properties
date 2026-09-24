"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { isRemoteImage } from "@/lib/cms/schema";

/* ------------------------------------------------------------------------------------------------
 * Admin primitives: the site's language in daylight. White surfaces on a cream page, ink type,
 * 11px uppercase labels, dashed hairlines, gold for the active item and the primary action.
 * Everything is a plain labelled control a non-technical person can read.
 * ---------------------------------------------------------------------------------------------- */

export const LINE = "rgba(79, 71, 66, 0.22)";
export const LABEL = "font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px]";
export const INPUT = "w-full border border-dashed bg-white px-3 font-inter text-[14px] font-medium leading-5 text-[var(--color-ink)] outline-none transition-colors placeholder:text-[rgba(79,71,66,0.4)] focus:border-solid focus:border-[var(--color-gold-ink)] disabled:opacity-50";
const inputStyle = { borderColor: LINE };

export function Card({ title, hint, children, className, actions }: { title?: string; hint?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("flex flex-col gap-5 border border-dashed bg-white p-6", className)} style={inputStyle}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {title && <h2 className="font-display text-[18px] font-normal leading-[1.2] tracking-[-0.01em] text-[var(--color-ink)]">{title}</h2>}
            {hint && <p className="font-inter text-[13px] font-medium leading-[18px] text-[var(--color-ink-2)]">{hint}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className={cn(LABEL, "text-[var(--color-ink-2)]")}>{label}</span>
      {children}
      {hint && <span className="font-inter text-[12px] font-medium leading-4 text-[rgba(79,71,66,0.6)]">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text", className, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string; disabled?: boolean }) {
  return <input type={type} value={value} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(INPUT, "h-10", className)} style={inputStyle} />;
}

export function NumberInput({ value, onChange, min, step = 1, className, placeholder }: { value: number | null; onChange: (v: number | null) => void; min?: number; step?: number; className?: string; placeholder?: string }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value ?? ""}
      min={min}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      className={cn(INPUT, "h-10", className)}
      style={inputStyle}
    />
  );
}

export function TextArea({ value, onChange, rows = 3, placeholder, className }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; className?: string }) {
  return <textarea value={value} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(INPUT, "resize-y py-2", className)} style={inputStyle} />;
}

export function Select<T extends string>({ value, onChange, options, className }: { value: T; onChange: (v: T) => void; options: readonly { value: T; label: string }[] | readonly T[]; className?: string }) {
  const opts = (options as readonly (T | { value: T; label: string })[]).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className={cn(INPUT, "h-10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path d=%22M2 4l4 4 4-4%22 fill=%22none%22 stroke=%22%234f4742%22 stroke-width=%221.25%22/></svg>')] bg-[length:12px] bg-[position:right_12px_center] bg-no-repeat pr-8", className)} style={inputStyle}>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full cursor-pointer items-center justify-between gap-4 py-1 text-left outline-none">
      <span className="flex flex-col gap-0.5">
        <span className="font-inter text-[14px] font-medium text-[var(--color-ink)]">{label}</span>
        {hint && <span className="font-inter text-[12px] font-medium text-[rgba(79,71,66,0.6)]">{hint}</span>}
      </span>
      <span className="relative block h-6 w-11 shrink-0 rounded-full transition-colors" style={{ backgroundColor: checked ? "var(--color-gold)" : "rgba(79,71,66,0.2)" }}>
        <span className="absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform" style={{ transform: `translateX(${checked ? 22 : 2}px)` }} />
      </span>
    </button>
  );
}

type ButtonVariant = "primary" | "ghost" | "danger";
export function Button({ children, onClick, variant = "ghost", disabled, type = "button", className, title }: { children: ReactNode; onClick?: () => void; variant?: ButtonVariant; disabled?: boolean; type?: "button" | "submit"; className?: string; title?: string }) {
  const look =
    variant === "primary"
      ? "bg-[var(--color-gold)] text-black hover:bg-[var(--color-gold-light)] border-transparent"
      : variant === "danger"
        ? "border-dashed text-[#a2432d] hover:border-[#a2432d] hover:bg-[#a2432d]/5"
        : "border-dashed text-[var(--color-ink)] hover:border-[var(--color-gold-ink)] hover:text-[var(--color-gold-ink)]";
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={cn(LABEL, "flex h-10 cursor-pointer items-center justify-center gap-2 border px-4 outline-none transition-colors disabled:cursor-default disabled:opacity-50", look, className)} style={variant === "primary" ? undefined : inputStyle}>
      {children}
    </button>
  );
}

/** An editable list: reorder with the arrows, remove, add at the bottom. `render` draws one row. */
export function ListEditor<T>({ items, onChange, render, add, addLabel = "Add", empty = "Nothing here yet.", max }: { items: T[]; onChange: (next: T[]) => void; render: (item: T, update: (next: T) => void, index: number) => ReactNode; add?: () => T; addLabel?: string; empty?: string; max?: number }) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && <p className="font-inter text-[13px] font-medium text-[rgba(79,71,66,0.6)]">{empty}</p>}
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 border border-dashed p-3" style={inputStyle}>
          <div className="min-w-0 flex-1">{render(item, (next) => onChange(items.map((it, k) => (k === i ? next : it))), i)}</div>
          <div className="flex shrink-0 flex-col gap-1">
            <IconButton label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>↑</IconButton>
            <IconButton label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</IconButton>
            <IconButton label="Remove" onClick={() => onChange(items.filter((_, k) => k !== i))} danger>×</IconButton>
          </div>
        </div>
      ))}
      {add && (!max || items.length < max) && (
        <Button onClick={() => onChange([...items, add()])} className="self-start">
          + {addLabel}
        </Button>
      )}
    </div>
  );
}

export function IconButton({ children, label, onClick, disabled, danger }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={cn("flex h-7 w-7 cursor-pointer items-center justify-center border border-dashed font-inter text-[13px] outline-none transition-colors disabled:cursor-default disabled:opacity-30", danger ? "text-[#a2432d] hover:border-[#a2432d]" : "text-[var(--color-ink)] hover:border-[var(--color-gold-ink)] hover:text-[var(--color-gold-ink)]")} style={inputStyle}>
      {children}
    </button>
  );
}

/** A thumbnail for any media src (images through next/image, videos as a labelled tile). */
export function Thumb({ src, alt = "", className, sizes = "160px" }: { src: string | null | undefined; alt?: string; className?: string; sizes?: string }) {
  const isVideo = !!src && /\.(mp4|webm)$/i.test(src);
  return (
    <span className={cn("relative block overflow-hidden bg-[#ece8e1]", className)}>
      {src ? isVideo ? <span className={cn(LABEL, "absolute inset-0 flex items-center justify-center text-[var(--color-ink-2)]")}>Video</span> : <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" unoptimized={isRemoteImage(src)} /> : <span className={cn(LABEL, "absolute inset-0 flex items-center justify-center text-[rgba(79,71,66,0.5)]")}>No photo</span>}
    </span>
  );
}

/** Small transient message, bottom right. */
export function Toast({ message, tone = "ok", onDone }: { message: string | null; tone?: "ok" | "error"; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, tone === "error" ? 5000 : 2600);
    return () => clearTimeout(t);
  }, [message, tone, onDone]);
  if (!message) return null;
  return (
    <div role="status" className={cn("fixed bottom-6 right-6 z-[70] flex items-center gap-3 border px-4 py-3 font-inter text-[13px] font-medium shadow-lg", tone === "error" ? "border-[#a2432d] bg-white text-[#a2432d]" : "border-black bg-black text-white")}>
      <span className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone === "error" ? "#a2432d" : "var(--color-gold)" }} />
      {message}
    </div>
  );
}

/** Keeps a piece of state in localStorage (API keys, a filter) without ever sending it anywhere. */
export function useLocalState<T>(key: string, initial: T): [T, (v: T) => void] {
  // Read once, lazily: the admin screens only render in the browser after the document has loaded.
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  };
  return [value, set];
}
