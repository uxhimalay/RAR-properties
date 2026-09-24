import { DEALS_VISIT } from "@/lib/content";
import type { BookingSettings } from "@/lib/cms/schema";

const DEFAULT_SETTINGS: BookingSettings = {
  slots: [...DEALS_VISIT.slots],
  leadMinutes: 60,
  monthsAhead: 6,
  durationMinutes: DEALS_VISIT.durationMinutes,
  place: DEALS_VISIT.place,
  timezoneLabel: DEALS_VISIT.timezone.label,
  utcOffsetMinutes: DEALS_VISIT.timezone.utcOffsetMinutes,
};

/**
 * Booking a visit (card 01 of the deals section).
 *
 * There is no backend yet. `bookVisit` stands in for the request that will go to an API route or a
 * scheduling service; the UI already handles its pending and failure states, so wiring it up is a
 * matter of replacing the body. `visitIcs` builds the calendar file the confirmation offers.
 *
 * All dates handed in carry the property's wall-clock time in their local fields (see the note on
 * time in BookVisit.tsx); `slot` is "HH:MM" in that same zone.
 */

export interface VisitRequest {
  date: Date;
  slot: string;
  name: string;
  email: string;
  phone: string;
}

export async function bookVisit(request: VisitRequest): Promise<void> {
  void request;
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export interface EnquiryRequest {
  name: string;
  email: string;
  phone: string;
  /** "Buy" | "Rent" | "Invest" | "Sell" */
  interest: string;
  message: string;
  /** What the visitor was looking at when they opened the drawer (a category, a service, "Price list"). */
  subject?: string;
}

/** The enquiry drawer's submit. Same stub as `bookVisit` until there is a backend. */
export async function sendEnquiry(request: EnquiryRequest): Promise<void> {
  void request;
  await new Promise((resolve) => setTimeout(resolve, 600));
}

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

/** The instant a slot starts, converting the property's wall-clock time to UTC with its fixed offset. */
export function slotInstant(date: Date, slot: string, utcOffsetMinutes = DEFAULT_SETTINGS.utcOffsetMinutes): Date {
  const [h, m] = slot.split(":").map(Number);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, h * 60 + m - utcOffsetMinutes));
}

/** RFC 5545 text escaping for a single property value. */
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function visitIcs({ date, slot, name, settings = DEFAULT_SETTINGS }: Pick<VisitRequest, "date" | "slot" | "name"> & { settings?: BookingSettings }): string {
  const start = slotInstant(date, slot, settings.utcOffsetMinutes);
  const end = new Date(start.getTime() + settings.durationMinutes * 60000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ArcSphere Studio//Visit//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${stamp(start)}-visit@arcsphere.studio`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeText(DEALS_VISIT.booked.calendarTitle)}`,
    `LOCATION:${escapeText(settings.place)}`,
    `DESCRIPTION:${escapeText(`Visit booked for ${name}. Times are ${settings.timezoneLabel} (UTC${settings.utcOffsetMinutes >= 0 ? "+" : "-"}${Math.abs(settings.utcOffsetMinutes) / 60}).`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
