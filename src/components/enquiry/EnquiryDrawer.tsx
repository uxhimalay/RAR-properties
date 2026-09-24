"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ENQUIRY } from "@/lib/content";
import { useSiteContent } from "@/lib/cms/context";
import { sendEnquiry } from "@/lib/booking";
import { pauseScroll } from "@/components/LenisProvider";
import { CloseIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";

/* ------------------------------------------------------------------------------------------------
 * EnquiryDrawer
 *
 * The page's one way to reach the agency in writing: a panel sliding in from the right (full width
 * on phone) in the deals section's language: black, white type, gold accent, dashed hairlines.
 *
 * - Shows what the visitor was looking at as a chip ("Regarding: Residential") when opened with a
 *   subject, and sends it with the message.
 * - Name and email required, phone optional, an "I want to" choice, a message. Validation on
 *   submit, first invalid field focused, pending state on the button, a failure line.
 * - Direct channels at the bottom (WhatsApp, call, email) so nobody has to fill a form.
 * - Escape, the close button and the backdrop close it; focus goes to the first field on open and
 *   back to the opener on close; page scrolling pauses while it is open.
 *
 * `sendEnquiry` in src/lib/booking.ts is a stub until there is a backend.
 * ---------------------------------------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1] as const;
const GOLD = "var(--color-gold)";
const GOLD_LIGHT = "var(--color-gold-light)";
const LINE = "rgba(255, 255, 255, 0.22)";
const MUTED = "rgba(255, 255, 255, 0.55)";
const LABEL = "font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px]";
const SMALL = "font-inter text-[12px] font-medium leading-[16px]";
const INPUT = "w-full border border-dashed border-[rgba(255,255,255,0.22)] bg-transparent px-3 font-inter text-[14px] font-medium text-white outline-none transition-colors placeholder:text-white/30 focus:border-solid focus:border-[var(--color-gold-light)] aria-invalid:border-solid aria-invalid:border-[var(--color-gold-light)]";
const PRIMARY = `${LABEL} flex h-11 w-full cursor-pointer items-center justify-center bg-[var(--color-gold)] text-black outline-none transition-colors duration-200 hover:bg-[var(--color-gold-light)] focus-visible:bg-[var(--color-gold-light)] disabled:cursor-default disabled:opacity-60 disabled:hover:bg-[var(--color-gold)]`;

interface Fields { name: string; email: string; phone: string; message: string }
type Field = keyof Fields;
const EMPTY: Fields = { name: "", email: "", phone: "", message: "" };

function validate(f: Fields): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (!f.name.trim()) errors.name = ENQUIRY.errors.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.email = ENQUIRY.errors.email;
  if (f.phone.trim() && f.phone.replace(/\D/g, "").length < 6) errors.phone = ENQUIRY.errors.phone;
  return errors;
}

export function EnquiryDrawer({ subject, onClose }: { subject?: string; onClose: () => void }) {
  const { contact: CONTACT } = useSiteContent();
  const whatsappHref = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`;
  const telHref = `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`;
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [interest, setInterest] = useState<string>(ENQUIRY.interests[0]);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes; focus moves in on open and back to the opener on close; the page stops scrolling.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLInputElement>("#enquiry-name")?.focus({ preventScroll: true });
    const resume = pauseScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      resume();
      opener?.focus({ preventScroll: true });
    };
  }, [onClose]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next = validate(fields);
    setErrors(next);
    const firstInvalid = (["name", "email", "phone"] as Field[]).find((k) => next[k]);
    if (firstInvalid) {
      panelRef.current?.querySelector<HTMLInputElement>(`#enquiry-${firstInvalid}`)?.focus({ preventScroll: true });
      return;
    }
    setPending(true);
    setFailed(false);
    try {
      await sendEnquiry({ ...fields, name: fields.name.trim(), email: fields.email.trim(), phone: fields.phone.trim(), interest, subject });
      setSent(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  };

  const field = (key: Field, label: string, type: string, autoComplete: string, inputMode?: "email" | "tel") => {
    const error = errors[key];
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={`enquiry-${key}`} className={LABEL} style={{ color: MUTED }}>{label}</label>
        <input
          id={`enquiry-${key}`}
          name={key}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={key !== "phone"}
          value={fields[key]}
          onChange={(e) => {
            setFields({ ...fields, [key]: e.target.value });
            if (error) setErrors((prev) => ({ ...prev, [key]: undefined }));
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `enquiry-${key}-error` : undefined}
          className={cn(INPUT, "h-10")}
        />
        {error && <p id={`enquiry-${key}-error`} className={SMALL} style={{ color: GOLD_LIGHT }}>{error}</p>}
      </div>
    );
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 z-[60] bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={onClose}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ENQUIRY.title}
        data-lenis-prevent
        className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-[480px] flex-col overflow-y-auto bg-black text-white outline-none"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {/* gold hairline on the panel's edge */}
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px" style={{ backgroundColor: "rgba(201, 169, 98, 0.5)" }} />

        <div className="flex items-start justify-between gap-6 p-6 tablet:p-8">
          <div className="flex flex-col gap-3">
            <p className={LABEL} style={{ color: GOLD }}>{ENQUIRY.eyebrow}</p>
            <h2 className="font-display text-[28px] font-normal leading-[1.1] tracking-[-0.02em] text-white tablet:text-[34px]">{ENQUIRY.title}</h2>
            <p className="font-inter text-[14px] font-medium leading-5 tracking-[0.28px]" style={{ color: MUTED }}>{ENQUIRY.intro}</p>
            {subject && (
              <span className={cn(LABEL, "inline-flex w-fit items-center gap-2 border border-dashed px-3 py-2")} style={{ borderColor: "rgba(201, 169, 98, 0.6)", color: GOLD_LIGHT }}>
                {ENQUIRY.subjectPrefix}: {subject}
              </span>
            )}
          </div>
          <button type="button" aria-label={ENQUIRY.close} onClick={onClose} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/10 outline-none transition-colors hover:bg-white/20 focus-visible:bg-white/20">
            <CloseIcon className="h-4 w-4 text-white" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col gap-4 px-6 pb-8 tablet:px-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: GOLD, color: GOLD }} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <h3 role="status" className="font-display text-[20px] font-normal leading-6 text-white">{ENQUIRY.success.title}</h3>
            <p className="font-inter text-[16px] font-medium leading-[22.4px] tracking-[0.32px]" style={{ color: MUTED }}>{ENQUIRY.success.note.replace("{email}", fields.email.trim())}</p>
            <button type="button" onClick={onClose} className={cn(PRIMARY, "mt-2")}>{ENQUIRY.close}</button>
          </div>
        ) : (
          <form className="flex flex-col gap-5 px-6 pb-8 tablet:px-8" onSubmit={submit} noValidate>
            {field("name", ENQUIRY.fields.name, "text", "name")}
            {field("email", ENQUIRY.fields.email, "email", "email", "email")}
            {field("phone", ENQUIRY.fields.phone, "tel", "tel", "tel")}
            <div className="flex flex-col gap-2">
              <p id="enquiry-interest" className={LABEL} style={{ color: MUTED }}>{ENQUIRY.interestLabel}</p>
              <div role="group" aria-labelledby="enquiry-interest" className="grid grid-cols-4 gap-2">
                {ENQUIRY.interests.map((it) => {
                  const on = it === interest;
                  return (
                    <button key={it} type="button" aria-pressed={on} onClick={() => setInterest(it)} className="h-10 cursor-pointer border border-dashed font-inter text-[12px] font-medium outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/60" style={{ borderColor: on ? GOLD_LIGHT : LINE, backgroundColor: on ? "#262626" : "transparent", color: on ? GOLD : "#fff" }}>
                      {it}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="enquiry-message" className={LABEL} style={{ color: MUTED }}>{ENQUIRY.fields.message}</label>
              <textarea id="enquiry-message" name="message" rows={4} value={fields.message} onChange={(e) => setFields({ ...fields, message: e.target.value })} className={cn(INPUT, "resize-none py-2")} />
            </div>
            <p className={SMALL} style={{ color: MUTED }}>{ENQUIRY.privacy}</p>
            {failed && <p role="alert" className={SMALL} style={{ color: GOLD_LIGHT }}>{ENQUIRY.errors.failed}</p>}
            <button type="submit" disabled={pending} aria-busy={pending || undefined} className={PRIMARY}>
              {pending ? ENQUIRY.pending : ENQUIRY.submit}
            </button>
          </form>
        )}

        {/* direct channels */}
        <div className="mt-auto flex flex-col gap-4 border-t border-dashed px-6 py-6 tablet:px-8" style={{ borderColor: LINE }}>
          <p className={LABEL} style={{ color: MUTED }}>{ENQUIRY.channels.title}</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: ENQUIRY.channels.whatsapp, href: whatsappHref, icon: <WhatsAppIcon className="h-4 w-4" />, external: true },
              { label: ENQUIRY.channels.call, href: telHref, icon: <PhoneIcon className="h-4 w-4" />, external: false },
              { label: ENQUIRY.channels.email, href: `mailto:${CONTACT.email}`, icon: <MailIcon className="h-4 w-4" />, external: false },
            ].map((c) => (
              <a key={c.label} href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noreferrer" : undefined} className={cn(LABEL, "flex h-11 items-center justify-center gap-2 border border-dashed outline-none transition-colors duration-200 hover:border-[var(--color-gold)] focus-visible:border-[var(--color-gold)]")} style={{ borderColor: LINE, color: GOLD }}>
                {c.icon}
                {c.label}
              </a>
            ))}
          </div>
          <p className={SMALL} style={{ color: MUTED }}>{CONTACT.hours}</p>
        </div>
      </motion.div>
    </>,
    document.body,
  );
}

export default EnquiryDrawer;
