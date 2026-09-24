"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DEALS, DEALS_VISIT } from "@/lib/content";
import type { BookingSettings } from "@/lib/cms/schema";
import { bookVisit, visitIcs } from "@/lib/booking";
import { ACCENT, Caption, DASHED, LINE, MARK, MUTED, StepNumber, SURFACE_ACTIVE } from "@/components/sections/DealsPrimitives";

/* ------------------------------------------------------------------------------------------------
 * BookVisit: card 01 of the deals bento. A complete book-a-visit flow inside one card, the card's
 * height animating between its views:
 *
 *   week      "01", the caption and a seven-day strip starting from today. Hovering previews a day;
 *             clicking one opens the calendar on it. A day with no times left is greyed out.
 *   calendar  The whole month, six rows, Sunday-first, month paging up to the configured months ahead. Past
 *             days and times are disabled (a time needs the configured notice); today carries a dot
 *             and aria-current. The chosen day is the one tab stop of the grid and the arrow keys,
 *             Home/End and PageUp/PageDown move it (WAI-ARIA grid pattern). The time row states the
 *             zone and the visit length; the button carries the choice ("Continue · Sun 20 Sep, 14:00").
 *   details   Name, email, phone (optional), validated on submit with the first invalid field
 *             focused, a privacy line, a pending state on the button and a failure message.
 *   booked    Confirmation with the date, time and zone, the place, the email that will be used,
 *             an "Add to calendar" (.ics download) and "Change booking", which reopens the calendar
 *             with everything kept.
 *
 * Escape steps back one view from anywhere on the page. Details typed are kept while stepping back.
 *
 * Time: visits happen at the property, so every date here is the PROPERTY's wall clock (Dubai,
 * fixed UTC+4), held in a Date's local fields. `wallNow()` shifts the visitor's clock into that
 * zone, so "today", "past" and "too soon" are judged where the visit happens, whatever the visitor's
 * zone. Dates are built on the client only (the page is statically prerendered, so the server has
 * no idea what "today" is): before hydration the strip renders seven empty cells of the same size.
 *
 * The booking itself is `bookVisit` in src/lib/booking.ts, a stub until there is a backend.
 * ---------------------------------------------------------------------------------------------- */

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const EASE = [0.22, 1, 0.36, 1] as const;
/** Times, notice, horizon, length, place and zone come from the content document; these are the fallbacks. */
const DEFAULT_BOOKING: BookingSettings = {
  slots: [...DEALS_VISIT.slots],
  leadMinutes: 60,
  monthsAhead: 6,
  durationMinutes: DEALS_VISIT.durationMinutes,
  place: DEALS_VISIT.place,
  timezoneLabel: DEALS_VISIT.timezone.label,
  utcOffsetMinutes: DEALS_VISIT.timezone.utcOffsetMinutes,
};
const BookingContext = createContext<BookingSettings>(DEFAULT_BOOKING);
const useBooking = () => useContext(BookingContext);
const offsetLabel = (b: BookingSettings) => `UTC${b.utcOffsetMinutes >= 0 ? "+" : "-"}${Math.abs(b.utcOffsetMinutes) / 60}`;

/* ----------------------------------- dates --------------------------------------------------- */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();
const longDate = (d: Date) => `${WEEKDAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
const shortDate = (d: Date) => `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;

/** The property's wall-clock "now", carried in a Date's local fields. */
function wallNow(b: BookingSettings): Date {
  const now = new Date();
  return new Date(now.getTime() + (b.utcOffsetMinutes + now.getTimezoneOffset()) * 60000);
}
/** Wall-clock start of a slot on a day. */
function slotTime(day: Date, slot: string): Date {
  const [h, m] = slot.split(":").map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
}
const slotOpen = (b: BookingSettings, day: Date, slot: string, now: Date) => slotTime(day, slot).getTime() - now.getTime() >= b.leadMinutes * 60000;
const dayOpen = (b: BookingSettings, day: Date, now: Date) => b.slots.some((s) => slotOpen(b, day, s, now));
const firstOpenSlot = (b: BookingSettings, day: Date, now: Date) => b.slots.find((s) => slotOpen(b, day, s, now)) ?? b.slots[0];

/** "September 2026", or "September – October 2026" / "December 2026 – January 2027" when the week crosses a boundary. */
function rangeLabel(from: Date, to: Date) {
  if (from.getMonth() === to.getMonth()) return `${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()}`;
  if (from.getFullYear() === to.getFullYear()) return `${MONTH_NAMES[from.getMonth()]} – ${MONTH_NAMES[to.getMonth()]} ${to.getFullYear()}`;
  return `${MONTH_NAMES[from.getMonth()]} ${from.getFullYear()} – ${MONTH_NAMES[to.getMonth()]} ${to.getFullYear()}`;
}

/* ----------------------------------- styles -------------------------------------------------- */

import { LABEL } from "@/lib/design";
const BODY = "font-inter text-[16px] font-medium leading-[22.4px] tracking-[0.32px]";
const SMALL = "font-inter text-[12px] font-medium leading-[16px]";
const CELL_ACTIVE = { borderColor: MARK, backgroundColor: SURFACE_ACTIVE } as const;
const CELL_REST = { borderColor: LINE, backgroundColor: "transparent" } as const;
const DIM = "rgba(255,255,255,0.22)";
const TEXT_LINK = `${LABEL} cursor-pointer text-white/55 outline-none transition-colors hover:text-white focus-visible:text-white`;
const PRIMARY = `${LABEL} flex h-11 w-full cursor-pointer items-center justify-center bg-[var(--color-gold)] text-black outline-none transition-colors duration-200 hover:bg-[var(--color-gold-light)] focus-visible:bg-[var(--color-gold-light)] disabled:cursor-default disabled:opacity-60 disabled:hover:bg-[var(--color-gold)]`;
const RING = "focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/60";

/* ----------------------------------- height animation ---------------------------------------- */

/** Animates its height to whatever its content measures, so the card (and the grid row) glides between views. */
function AutoHeight({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <motion.div className="w-full overflow-hidden" initial={false} animate={{ height: height ?? "auto" }} transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: EASE }}>
      <div ref={ref}>{children}</div>
    </motion.div>
  );
}

const VIEW_MOTION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: EASE },
} as const;

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ transform: dir === "left" ? "scaleX(-1)" : undefined }}>
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackButton({ onClick, label = DEALS_VISIT.back }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className={`${TEXT_LINK} flex items-center gap-1.5`}>
      <Chevron dir="left" />
      {label}
    </button>
  );
}

/* ----------------------------------- week strip ---------------------------------------------- */

function WeekStrip({ now, onPick }: { now: Date | null; onPick: (d: Date) => void }) {
  const b = useBooking();
  const [hover, setHover] = useState<number | null>(null);
  const today = now ? startOfDay(now) : null;
  const days = today ? Array.from({ length: 7 }, (_, i) => addDays(today, i)) : [];
  const open = days.map((d) => (now ? dayOpen(b, d, now) : false));
  const active = hover ?? Math.max(0, open.indexOf(true));
  return (
    <div className="flex w-full flex-col gap-3" onPointerLeave={() => setHover(null)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className={LABEL} style={{ color: MUTED }}>{today ? rangeLabel(days[0], days[6]) : " "}</p>
        <p className={LABEL} style={{ color: ACCENT }}>{today && !open[0] ? DEALS_VISIT.noTimesToday : DEALS_VISIT.hint}</p>
      </div>
      <div role="group" aria-label="This week" className="grid grid-cols-7 border-t" style={DASHED}>
        {today
          ? days.map((d, i) => {
              const isActive = i === active && open[i];
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${longDate(d)}${open[i] ? "" : `, ${DEALS_VISIT.noTimesToday.toLowerCase()}`}`}
                  aria-current={i === 0 ? "date" : undefined}
                  disabled={!open[i]}
                  onPointerEnter={() => open[i] && setHover(i)}
                  onFocus={() => setHover(i)}
                  onClick={() => onPick(d)}
                  className={`flex h-14 cursor-pointer flex-col items-center justify-center gap-1 border-b border-r border-dashed outline-none transition-colors duration-200 first:border-l disabled:cursor-default ${RING}`}
                  style={isActive ? CELL_ACTIVE : CELL_REST}
                >
                  <span className="font-inter text-[10px] font-medium" style={{ color: open[i] ? MUTED : DIM }}>{WEEKDAY_LETTERS[d.getDay()]}</span>
                  <span className="font-inter text-[14px] font-medium" style={{ color: !open[i] ? DIM : isActive ? ACCENT : "#fff" }}>{d.getDate()}</span>
                </button>
              );
            })
          : Array.from({ length: 7 }, (_, i) => <div key={i} className="h-14 border-b border-r border-dashed first:border-l" style={{ borderColor: LINE }} />)}
      </div>
    </div>
  );
}

/* ----------------------------------- month calendar ------------------------------------------ */

interface CalendarProps {
  now: Date;
  initialDate: Date;
  initialSlot?: string;
  onBack: () => void;
  onContinue: (date: Date, slot: string) => void;
}

function MonthCalendar({ now, initialDate, initialSlot, onBack, onContinue }: CalendarProps) {
  const b = useBooking();
  const today = startOfDay(now);
  const [selected, setSelected] = useState(initialDate);
  const [month, setMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [slot, setSlot] = useState<string>(() => (initialSlot && slotOpen(b, initialDate, initialSlot, now) ? initialSlot : firstOpenSlot(b, initialDate, now)));

  const first = month.getDay(); // Sunday-first, as the strip
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  // Always six rows, so paging months never changes the card's height.
  const cells = Array.from({ length: 42 }, (_, i) => {
    const n = i - first + 1;
    return n >= 1 && n <= daysInMonth ? new Date(month.getFullYear(), month.getMonth(), n) : null;
  });
  const rows = Array.from({ length: 6 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
  const lastMonth = monthIndex(today) + b.monthsAhead;
  const canPrev = monthIndex(month) > monthIndex(today);
  const canNext = monthIndex(month) < lastMonth;
  const page = (by: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1));
  const isOpen = (d: Date) => d >= today && monthIndex(d) <= lastMonth && dayOpen(b, d, now);

  // Roving tab stop: the chosen day when it is on screen, else the month's first open day.
  const tabStop = cells.some((c) => c && sameDay(c, selected)) ? selected : (cells.find((c) => c && isOpen(c)) ?? null);

  /** Choose a day (from a click or a key), paging the month to it if needed; ignored when it is not bookable. */
  const choose = (d: Date) => {
    if (!isOpen(d)) return;
    setSelected(d);
    if (!slotOpen(b, d, slot, now)) setSlot(firstOpenSlot(b, d, now));
    if (monthIndex(d) !== monthIndex(month)) setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const from = tabStop ?? selected;
    const step: Record<string, () => Date> = {
      ArrowRight: () => addDays(from, 1),
      ArrowLeft: () => addDays(from, -1),
      ArrowDown: () => addDays(from, 7),
      ArrowUp: () => addDays(from, -7),
      Home: () => addDays(from, -from.getDay()),
      End: () => addDays(from, 6 - from.getDay()),
      PageDown: () => new Date(from.getFullYear(), from.getMonth() + 1, Math.min(from.getDate(), new Date(from.getFullYear(), from.getMonth() + 2, 0).getDate())),
      PageUp: () => new Date(from.getFullYear(), from.getMonth() - 1, Math.min(from.getDate(), new Date(from.getFullYear(), from.getMonth(), 0).getDate())),
    };
    const to = step[e.key]?.();
    if (!to) return;
    e.preventDefault();
    // Home may land on a past day at the start of the week: walk forward to the first open one.
    let target = to;
    if (e.key === "Home") while (target < today && target < from) target = addDays(target, 1);
    choose(target);
  };

  // Focus follows the chosen day (including on open: the strip button that opened this has unmounted).
  const selectedRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    selectedRef.current?.focus({ preventScroll: true });
  }, [selected, month]);

  const navButton = `flex h-7 w-7 cursor-pointer items-center justify-center text-white/70 outline-none transition-colors hover:text-white focus-visible:text-white disabled:cursor-default disabled:text-white/20`;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* header: back on the left, month with paging on the right */}
      <div className="flex items-center justify-between gap-4">
        <BackButton onClick={onBack} />
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous month" disabled={!canPrev} onClick={() => page(-1)} className={navButton}><Chevron dir="left" /></button>
          <p className={`${LABEL} min-w-[112px] text-center text-white`} aria-live="polite">{MONTH_NAMES[month.getMonth()]} {month.getFullYear()}</p>
          <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => page(1)} className={navButton}><Chevron dir="right" /></button>
        </div>
      </div>

      {/* the month: an ARIA grid, one tab stop, arrow keys move the choice */}
      <div role="grid" aria-label={`${MONTH_NAMES[month.getMonth()]} ${month.getFullYear()}`} className="grid grid-cols-7" onKeyDown={onGridKey}>
        <div role="row" className="contents">
          {WEEKDAY_LETTERS.map((l, i) => (
            <span key={i} role="columnheader" aria-label={WEEKDAY_NAMES[i]} className="flex h-6 items-center justify-center font-inter text-[10px] font-medium" style={{ color: MUTED }}>{l}</span>
          ))}
        </div>
        {rows.map((row, r) => (
          <div key={r} role="row" className="contents">
            {row.map((d, c) => {
              const i = r * 7 + c;
              const edge = `${r === 0 ? "border-t" : ""} ${c === 0 ? "border-l" : ""}`;
              if (!d) return <div key={i} role="gridcell" aria-hidden="true" className={`h-10 border-b border-r border-dashed tablet:h-9 ${edge}`} style={{ borderColor: LINE }} />;
              const open = isOpen(d);
              const isSelected = sameDay(d, selected);
              const isToday = sameDay(d, today);
              return (
                <button
                  key={i}
                  ref={isSelected ? selectedRef : undefined}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={`${longDate(d)}${open ? "" : isToday ? `, ${DEALS_VISIT.noTimesToday.toLowerCase()}` : ", unavailable"}`}
                  tabIndex={tabStop && sameDay(d, tabStop) ? 0 : -1}
                  disabled={!open}
                  onClick={() => choose(d)}
                  className={`relative flex h-10 cursor-pointer items-center justify-center border-b border-r border-dashed font-inter text-[13px] font-medium outline-none transition-colors duration-200 tablet:h-9 disabled:cursor-default ${edge} ${RING}`}
                  style={{ ...(isSelected ? CELL_ACTIVE : CELL_REST), color: !open ? DIM : isSelected || isToday ? ACCENT : "#fff" }}
                >
                  {d.getDate()}
                  {isToday && <span aria-hidden="true" className="absolute bottom-1 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full" style={{ backgroundColor: open ? ACCENT : DIM }} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* visit time: zone and length stated, times that have passed disabled */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <p id="visit-time-label" className={LABEL} style={{ color: MUTED }}>{DEALS_VISIT.timeLabel}</p>
          <p className={LABEL} style={{ color: MUTED }}>{b.timezoneLabel} ({offsetLabel(b)}) · {b.durationMinutes} min</p>
        </div>
        <div role="group" aria-labelledby="visit-time-label" className="grid grid-cols-4 gap-2">
          {b.slots.map((t) => {
            const open = slotOpen(b, selected, t, now);
            const on = t === slot;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                disabled={!open}
                onClick={() => setSlot(t)}
                className={`h-10 cursor-pointer border border-dashed font-inter text-[12px] font-medium outline-none transition-colors duration-200 disabled:cursor-default disabled:line-through ${RING}`}
                style={{ ...(on ? CELL_ACTIVE : CELL_REST), color: !open ? DIM : on ? ACCENT : "#fff" }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <button type="button" onClick={() => onContinue(selected, slot)} className={PRIMARY}>
        {DEALS_VISIT.continue} · {shortDate(selected)}, {slot}
      </button>
    </div>
  );
}

/* ----------------------------------- details ------------------------------------------------- */

interface Details { name: string; email: string; phone: string }
type Field = keyof Details;
const EMPTY_DETAILS: Details = { name: "", email: "", phone: "" };
const FIELDS: { key: Field; label: string; type: string; autoComplete: string; inputMode?: "email" | "tel" }[] = [
  { key: "name", label: DEALS_VISIT.details.name, type: "text", autoComplete: "name" },
  { key: "email", label: DEALS_VISIT.details.email, type: "email", autoComplete: "email", inputMode: "email" },
  { key: "phone", label: DEALS_VISIT.details.phone, type: "tel", autoComplete: "tel", inputMode: "tel" },
];

function validate(d: Details): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (!d.name.trim()) errors.name = DEALS_VISIT.details.errors.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errors.email = DEALS_VISIT.details.errors.email;
  if (d.phone.trim() && d.phone.replace(/\D/g, "").length < 6) errors.phone = DEALS_VISIT.details.errors.phone;
  return errors;
}

interface DetailsProps {
  date: Date;
  slot: string;
  details: Details;
  onChange: (d: Details) => void;
  onBack: () => void;
  onBooked: () => void;
}

function DetailsForm({ date, slot, details, onChange, onBack, onBooked }: DetailsProps) {
  const b = useBooking();
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const focusField = (key: Field) => formRef.current?.querySelector<HTMLInputElement>(`#visit-${key}`)?.focus({ preventScroll: true });
  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>("#visit-name")?.focus({ preventScroll: true });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate(details);
    setErrors(next);
    const firstInvalid = FIELDS.map((f) => f.key).find((f) => next[f]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }
    setPending(true);
    setFailed(false);
    try {
      await bookVisit({ date, slot, name: details.name.trim(), email: details.email.trim(), phone: details.phone.trim() });
      onBooked();
    } catch {
      setFailed(true);
      setPending(false);
    }
  };

  return (
    <form ref={formRef} className="flex w-full flex-col gap-5" onSubmit={submit} noValidate>
      <div className="flex items-center justify-between gap-4">
        <BackButton onClick={onBack} />
        <p className={`${LABEL} text-white`}>{DEALS_VISIT.details.title}</p>
      </div>

      {/* what is being booked */}
      <div className="flex flex-col gap-1 border border-dashed px-4 py-3" style={{ borderColor: LINE }}>
        <p className={`${BODY} text-white`}>{longDate(date)} · {slot} {b.timezoneLabel}</p>
        <p className={SMALL} style={{ color: MUTED }}>{b.place}. About {b.durationMinutes} minutes.</p>
      </div>

      <div className="flex flex-col gap-4">
        {FIELDS.map(({ key, label, type, autoComplete, inputMode }) => {
          const error = errors[key];
          return (
            <div key={key} className="flex flex-col gap-2">
              <label htmlFor={`visit-${key}`} className={LABEL} style={{ color: MUTED }}>{label}</label>
              <input
                id={`visit-${key}`}
                name={key}
                type={type}
                autoComplete={autoComplete}
                inputMode={inputMode}
                required={key !== "phone"}
                value={details[key]}
                onChange={(e) => {
                  onChange({ ...details, [key]: e.target.value });
                  if (error) setErrors((prev) => ({ ...prev, [key]: undefined }));
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `visit-${key}-error` : undefined}
                className="h-10 w-full border border-dashed border-[rgba(255,255,255,0.22)] bg-transparent px-3 font-inter text-[14px] font-medium text-white outline-none transition-colors placeholder:text-white/30 focus:border-solid focus:border-[var(--color-gold-light)] aria-invalid:border-solid aria-invalid:border-[var(--color-gold-light)]"
              />
              {error && <p id={`visit-${key}-error`} className={SMALL} style={{ color: MARK }}>{error}</p>}
            </div>
          );
        })}
      </div>

      <p className={SMALL} style={{ color: MUTED }}>{DEALS_VISIT.details.privacy}</p>
      {failed && <p role="alert" className={SMALL} style={{ color: MARK }}>{DEALS_VISIT.details.errors.failed}</p>}
      <button type="submit" disabled={pending} aria-busy={pending || undefined} className={PRIMARY}>
        {pending ? DEALS_VISIT.details.pending : DEALS_VISIT.details.confirm}
      </button>
    </form>
  );
}

/* ----------------------------------- confirmation -------------------------------------------- */

function Booked({ date, slot, details, onChange }: { date: Date; slot: string; details: Details; onChange: () => void }) {
  const b = useBooking();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const download = () => {
    const url = URL.createObjectURL(new Blob([visitIcs({ date, slot, name: details.name, settings: b })], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `arcsphere-visit-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex flex-col gap-8">
      <StepNumber n={1} />
      <div className="flex flex-col gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: ACCENT, color: ACCENT }} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h4 ref={headingRef} tabIndex={-1} role="status" className="mt-3 font-display text-[20px] font-normal leading-6 text-white outline-none">{DEALS_VISIT.booked.title}</h4>
        <p className={`${BODY} text-white`}>{longDate(date)} · {slot} {b.timezoneLabel}</p>
        <p className={BODY} style={{ color: MUTED }}>{b.place}. About {b.durationMinutes} minutes.</p>
        <p className={BODY} style={{ color: MUTED }}>{DEALS_VISIT.booked.note.replace("{email}", details.email)}</p>
      </div>
      <div className="flex flex-col gap-4">
        <button type="button" onClick={download} className={PRIMARY}>{DEALS_VISIT.booked.addToCalendar}</button>
        <button type="button" onClick={onChange} className={`${TEXT_LINK} self-start`}>{DEALS_VISIT.booked.change}</button>
      </div>
    </div>
  );
}

/* ----------------------------------- card ---------------------------------------------------- */

type View =
  | { name: "week" }
  | { name: "calendar"; date: Date; slot?: string }
  | { name: "details"; date: Date; slot: string }
  | { name: "booked"; date: Date; slot: string };

const subscribeNoop = () => () => {};

export function BookVisit({ settings = DEFAULT_BOOKING, visit }: { settings?: BookingSettings; visit?: { title: string; description: string } }) {
  // Client-only clock: the server snapshot is false, so the strip hydrates empty and fills on mount.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const [view, setView] = useState<View>({ name: "week" });
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  // Re-read the clock whenever the view changes or the tab comes back, so a card left open overnight
  // does not offer yesterday.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && setTick((t) => t + 1);
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `view` is the intended re-read trigger
  const now = useMemo(() => (mounted ? wallNow(settings) : null), [mounted, tick, view, settings]);

  // Escape steps back one view, from anywhere on the page.
  useEffect(() => {
    if (view.name === "week" || view.name === "booked") return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setView(view.name === "details" ? { name: "calendar", date: view.date, slot: view.slot } : { name: "week" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [view]);

  return (
    <BookingContext.Provider value={settings}>
    <AutoHeight>
      <AnimatePresence mode="wait" initial={false}>
        {view.name === "week" && (
          <motion.div key="week" {...VIEW_MOTION} className="flex flex-col gap-10">
            <div className="flex flex-col gap-10">
              <StepNumber n={1} />
              <Caption title={visit?.title ?? DEALS[0].title} description={visit?.description ?? DEALS[0].description} />
            </div>
            <WeekStrip now={now} onPick={(date) => setView({ name: "calendar", date })} />
          </motion.div>
        )}
        {view.name === "calendar" && now && (
          <motion.div key="calendar" {...VIEW_MOTION}>
            <MonthCalendar
              now={now}
              initialDate={view.date}
              initialSlot={view.slot}
              onBack={() => setView({ name: "week" })}
              onContinue={(date, slot) => setView({ name: "details", date, slot })}
            />
          </motion.div>
        )}
        {view.name === "details" && (
          <motion.div key="details" {...VIEW_MOTION}>
            <DetailsForm
              date={view.date}
              slot={view.slot}
              details={details}
              onChange={setDetails}
              onBack={() => setView({ name: "calendar", date: view.date, slot: view.slot })}
              onBooked={() => setView({ name: "booked", date: view.date, slot: view.slot })}
            />
          </motion.div>
        )}
        {view.name === "booked" && (
          <motion.div key="booked" {...VIEW_MOTION}>
            <Booked date={view.date} slot={view.slot} details={details} onChange={() => setView({ name: "calendar", date: view.date, slot: view.slot })} />
          </motion.div>
        )}
      </AnimatePresence>
    </AutoHeight>
    </BookingContext.Provider>
  );
}

export default BookVisit;
