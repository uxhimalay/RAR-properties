"use client";

import { useId, useState, type ComponentType, type FormEvent, type ReactNode, type SVGProps } from "react";
import { FadeUp } from "@/components/motion/FadeUp";
import { TextReveal } from "@/components/motion/TextReveal";
import { BehanceIcon, InstagramIcon, LinkedinIcon, PinterestIcon } from "@/components/icons";
import { CONTACT } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Contact section ("LET'S TALK ABOUT YOUR PROJECTS" + enquiry form).
 *
 * Desktop (>= 1200): two 50% columns, 737px tall. Left: heading block at the top, contact info
 * (phone / email / social / address) pinned to the bottom. Right: the form.
 * Tablet / phone (< 1200): single column, gap 32px; the contact info block is hidden and the
 * form heading + field list fade up (y 24) into view. Form metrics shrink: 12px input/select/label
 * text, 34px fields (8/0/8 + 18px input), 30px select, 28px pills; the submit stays 40px.
 * (Measured from docs/design-references/full-mobile-390.png / full-tablet-768.png.)
 *
 * The form is a mock: submit is prevented and nothing else happens.
 * No margins here: the page wrapper owns the spacing above/below.
 */

/* ------------------------------------------------------------------ shared class strings */

const INFO_LABEL = "font-display text-[16px] font-medium leading-6 text-ink";

/** 1px rgb(79,71,66) bottom rule drawn with ::after so the input itself stays borderless. */
const BOTTOM_RULE =
  "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink after:content-['']";

const FOCUS_SHADOW =
  "transition-shadow duration-300 ease-[cubic-bezier(0.44,0,0.56,1)] focus-within:shadow-[rgba(0,0,0,0.18)_0_0.6px_0.6px_-1.25px,rgba(0,0,0,0.16)_0_2.29px_2.29px_-2.5px,rgba(0,0,0,0.06)_0_10px_10px_-3.75px]";

/**
 * FadeUp is a framer-motion div that always animates. The site only plays the form "appear" below
 * 1200px, so on desktop the inline opacity/transform it writes are overridden with !important.
 */
const FADE_DESKTOP_OFF = "desktop:opacity-100! desktop:transform-none!";

/* ------------------------------------------------------------------ helpers */

/** Phone / email link: 12px label with a 1px underline that slides in from the left on hover. */
function LineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group flex flex-col items-center gap-[2px] overflow-hidden">
      <span className="whitespace-pre font-display text-[12px] font-medium leading-[18px] text-ink">{children}</span>
      <span aria-hidden className="relative h-px w-full overflow-hidden">
        <span className="absolute inset-y-0 left-0 w-full -translate-x-[105%] bg-ink transition-transform duration-[450ms] ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:translate-x-0" />
      </span>
    </a>
  );
}

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>;

/** Maps CONTACT.socials[].name -> icon. The 23-viewBox marks get 2.5px padding inside the 28px box; Behance fills it. */
const SOCIAL_ICONS: Record<string, { Icon: SocialIcon; label: string; padded: boolean }> = {
  InstagramLogo: { Icon: InstagramIcon, label: "Instagram", padded: true },
  LinkedinLogo: { Icon: LinkedinIcon, label: "LinkedIn", padded: true },
  PinterestLogo: { Icon: PinterestIcon, label: "Pinterest", padded: true },
  Behance: { Icon: BehanceIcon, label: "Behance", padded: false },
};

function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

interface FieldProps {
  name: string;
  placeholder: string;
  type: "text" | "email" | "tel";
  autoComplete?: string;
}

/**
 * Underlined text input. Desktop 55px tall (padding 12/0/16 + 27px input), below 1200 34px (8/0/8 + 18px input).
 * The wrapper picks up a soft drop shadow while the input is focused.
 */
function Field({ name, placeholder, type, autoComplete }: FieldProps) {
  return (
    <div className={cn("relative flex w-full items-center overflow-hidden py-2 desktop:pt-3 desktop:pb-4", BOTTOM_RULE, FOCUS_SHADOW)}>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete={autoComplete}
        required
        className="h-[18px] w-full bg-transparent font-display text-[12px] font-normal leading-[18px] tracking-[-0.3px] text-[#0d0d0d] outline-none placeholder:text-[#6b6b6b] desktop:h-[27px] desktop:text-[18px] desktop:leading-[27px]"
      />
    </div>
  );
}

interface SelectFieldProps {
  name: string;
  placeholder: string;
  options: string[];
}

/** Native select with the same bottom rule. Grey until a real option is chosen, then black. Desktop 48px, below 1200 30px. */
function SelectField({ name, placeholder, options }: SelectFieldProps) {
  const [value, setValue] = useState("");
  return (
    <div className={cn("relative flex w-full items-center", BOTTOM_RULE)}>
      <select
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={placeholder}
        required
        className={cn(
          "h-[30px] w-full appearance-none bg-transparent pr-6 font-inter text-[12px] font-normal leading-[14.4px] outline-none desktop:h-12 desktop:pt-3 desktop:pb-4 desktop:text-[17px] desktop:leading-[20.4px]",
          value ? "text-black" : "text-[#6b6b6b]",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute right-0 h-4 w-4 text-[#6b6b6b]" />
    </div>
  );
}

interface RadioGroupProps {
  label: string;
  options: string[];
}

/** Custom radio pills, two per row (flex-basis calc(50% - 8px), gap 16), 40px tall on desktop / 28px below. Single selection per group. */
function RadioGroup({ label, options }: RadioGroupProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const labelId = useId();
  return (
    <div className="flex w-full flex-col gap-4">
      <span id={labelId} className="font-inter text-[12px] font-normal leading-[14.4px] tracking-[-0.12px] text-[#6b6b6b] desktop:text-[17px] desktop:leading-[20.4px] desktop:tracking-[-0.17px]">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-4">
        {options.map((option) => {
          const checked = option === selected;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setSelected(option)}
              style={{ flex: "0 0 calc(50% - 8px)" }}
              className={cn(
                "flex h-7 items-center justify-center rounded-[999px] border px-[14px] font-inter text-[14px] font-medium leading-[14px] tracking-[-0.14px] transition-[background-color,border-color,color] duration-[180ms] desktop:h-10",
                checked
                  ? "border-[rgb(204,204,194)] bg-ink text-cream"
                  : "border-[rgba(79,71,66,0.16)] bg-[rgba(79,71,66,0.12)] text-ink",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ section */

const PHONE_HREF = `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`;

export function ContactSection() {
  const { form } = CONTACT;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="section-width flex flex-col items-start gap-8 desktop:flex-row desktop:justify-between desktop:gap-0">
      {/* ---------------------------------------------------------------- left column */}
      <div className="flex w-full flex-col items-start justify-between desktop:h-[737px] desktop:flex-1">
        {/* Heading */}
        <div className="flex flex-col items-start gap-3 overflow-clip">
          <TextReveal
            as="h2"
            text={CONTACT.heading}
            className="font-display text-[24px] font-medium uppercase leading-[33.6px] tracking-[-0.72px] text-ink desktop:max-w-[395px] desktop:text-[40px] desktop:leading-[56px] desktop:tracking-[-1.2px]"
          />
          <TextReveal
            as="p"
            text={CONTACT.paragraph}
            className="font-display text-[12px] font-medium capitalize leading-[15.6px] tracking-[-0.24px] text-ink-2 desktop:text-[16px] desktop:leading-[25.6px] desktop:tracking-[-0.32px]"
          />
        </div>

        {/* Contact Info: desktop only */}
        <div className="hidden w-full flex-col items-start gap-6 desktop:flex">
          <div className="flex w-full items-center gap-[10px] overflow-clip">
            <div className="flex flex-1 flex-col items-start gap-[6px]">
              <p className={INFO_LABEL}>{CONTACT.phoneLabel}</p>
              <LineLink href={PHONE_HREF}>{CONTACT.phone}</LineLink>
            </div>
            <div className="flex flex-1 flex-col items-start gap-[6px]">
              <p className={INFO_LABEL}>{CONTACT.emailLabel}</p>
              <LineLink href={CONTACT.emailHref}>{CONTACT.email}</LineLink>
            </div>
          </div>

          <div className="flex w-full items-center gap-[10px] overflow-clip">
            <div className="flex flex-1 flex-col items-start gap-[6px]">
              <p className={INFO_LABEL}>{CONTACT.socialLabel}</p>
              <div className="flex items-start gap-3">
                {CONTACT.socials.map((social) => {
                  const entry = SOCIAL_ICONS[social.name];
                  if (!entry) return null;
                  const { Icon, label, padded } = entry;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className={cn("block h-7 w-7 text-ink", padded && "p-[2.5px]")}
                    >
                      <Icon aria-hidden="true" className="h-full w-full" />
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-1 flex-col items-start gap-[6px]">
              <p className={INFO_LABEL}>{CONTACT.addressLabel}</p>
              <p className="font-display text-[12px] font-medium capitalize leading-[15.6px] tracking-[-0.3px] text-ink">{CONTACT.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- right column: form */}
      <div className="flex w-full flex-col items-start gap-14 overflow-clip desktop:flex-1">
        <form className="flex w-full flex-col items-start gap-7 overflow-hidden" onSubmit={handleSubmit}>
          <FadeUp y={24} className={FADE_DESKTOP_OFF}>
            <p className="font-display text-[14px] font-medium leading-[16.8px] tracking-[-0.28px] text-ink desktop:text-[20px] desktop:leading-6 desktop:tracking-[-0.4px]">
              {form.heading}
            </p>
          </FadeUp>

          <FadeUp y={24} className={cn("w-full", FADE_DESKTOP_OFF)}>
            <div className="flex w-full flex-col items-start gap-6">
              <Field name="Name" placeholder={form.fields.name} type="text" autoComplete="name" />
              <Field name="Email" placeholder={form.fields.email} type="email" autoComplete="email" />
              <Field name="Phone Number" placeholder={form.fields.phone} type="tel" autoComplete="tel" />
              <SelectField name="Service" placeholder={form.serviceSelect.placeholder} options={form.serviceSelect.options} />
              <RadioGroup label={form.projectType.label} options={form.projectType.options} />
              <Field name="Location" placeholder={form.fields.location} type="text" />
              <RadioGroup label={form.projectScale.label} options={form.projectScale.options} />
              <button
                type="submit"
                className="h-10 w-full rounded-[10px] bg-ink font-display text-[14px] font-semibold leading-[16.8px] text-white transition-colors duration-200 hover:bg-[rgba(64,54,48,0.85)]"
              >
                {form.submit}
              </button>
            </div>
          </FadeUp>
        </form>
      </div>
    </section>
  );
}

export default ContactSection;
