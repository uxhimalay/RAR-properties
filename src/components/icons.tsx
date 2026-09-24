import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/* ---------- Process step icons (24 viewBox, 1.5 stroke, currentColor) ---------- */

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 21l-4.34-4.34" />
      <circle cx={11} cy={11} r={8} />
    </svg>
  );
}

export function CubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M7.5 4.21l4.5 2.6 4.5-2.6" />
      <path d="M7.5 19.79V14.6L3 12" />
      <path d="M21 12l-4.5 2.6v5.19" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}

export function BulbIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.801 10c.941 4.618-1.471 9.267-5.789 11.157-4.318 1.89-9.369.509-12.124-3.316-2.755-3.824-2.465-9.053.695-12.55C7.744 1.794 12.917.979 17 3.335" />
      <path d="M9 11l3 3L22 4" />
    </svg>
  );
}

/* ---------- Rating star (filled, currentColor) ---------- */
export function StarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 17.727l5.13 3.155a.998.998 0 0 0 1.174-.038.998.998 0 0 0 .3-.822l-1.395-5.886 4.565-3.938a.998.998 0 0 0 .232-.84.998.998 0 0 0-.681-.545l-5.991-.488-2.308-5.587a.998.998 0 0 0-.726-.488.998.998 0 0 0-.726.488L9.266 8.325l-5.991.488a.998.998 0 0 0-.686.546.998.998 0 0 0 .237.844l4.565 3.937-1.395 5.882a.998.998 0 0 0 .3.822.998.998 0 0 0 1.174.038z" />
    </svg>
  );
}

/* ---------- Ticker separator dot (outlined 4.5px circle in a 24 box) ---------- */
export function TickerDotIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeMiterlimit={10} {...props}>
      <circle cx={12} cy={12} r={2.25} />
    </svg>
  );
}

/* ---------- Up arrow glyph used inside the rotated circular buttons (16px glyph in 24 box) ---------- */
export function ArrowUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path transform="translate(4 4)" d="M0 8l1.41 1.41L7 3.83V16h2V3.83l5.58 5.59L16 8 8 0z" />
    </svg>
  );
}

/* ---------- Diagonal arrow used inside the expertise "View Projects" pill ---------- */
export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

/* ---------- Footer contact icons (24 box, 2px stroke) ---------- */
export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx={12} cy={10} r={3} />
    </svg>
  );
}

/* ---------- Social logos (filled, currentColor) ---------- */
export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 23 23" fill="currentColor" {...props}>
      <path d="M16.625 0h-10.5C4.501.002 2.944.648 1.796 1.796.648 2.944.002 4.501 0 6.125v10.5c.002 1.624.648 3.181 1.796 4.329 1.148 1.148 2.705 1.794 4.329 1.796h10.5c1.624-.002 3.181-.648 4.329-1.796 1.148-1.148 1.794-2.705 1.796-4.329v-10.5c-.002-1.624-.648-3.181-1.796-4.329C19.806.648 18.249.002 16.625 0zm-5.25 16.625a5.25 5.25 0 1 1 0-10.5 5.25 5.25 0 0 1 0 10.5zm6.563-10.5a1.312 1.312 0 1 1 0-2.625 1.312 1.312 0 0 1 0 2.625zM14.875 11.375a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 23 23" fill="currentColor" {...props}>
      <path d="M21 0H1.75C.784 0 0 .784 0 1.75V21c0 .966.784 1.75 1.75 1.75H21c.966 0 1.75-.784 1.75-1.75V1.75C22.75.784 21.966 0 21 0zM7.875 16.625a.875.875 0 1 1-1.75 0v-7a.875.875 0 1 1 1.75 0v7zM7 7.875a1.313 1.313 0 1 1 0-2.625 1.313 1.313 0 0 1 0 2.625zm10.5 8.75a.875.875 0 1 1-1.75 0v-3.938a2.187 2.187 0 1 0-4.375 0v3.938a.875.875 0 1 1-1.75 0v-7a.875.875 0 0 1 1.727-.195 3.936 3.936 0 0 1 6.148 3.257v3.938z" />
    </svg>
  );
}

export function PinterestIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 23 23" fill="currentColor" {...props}>
      <path d="M22.751 11.452c-.042 6.179-5.082 11.236-11.259 11.297a11.38 11.38 0 0 1-2.838-.328.443.443 0 0 1-.318-.531l.945-3.779a6.98 6.98 0 0 0 2.97.702c4.046 0 7.295-3.659 6.979-8.024a7.02 7.02 0 1 0-13.156 3.54.875.875 0 1 0 1.614-.679 5.263 5.263 0 1 1 9.797-2.726c.234 3.339-2.201 6.139-5.234 6.139-.892 0-1.767-.244-2.531-.704l1.629-6.521a.875.875 0 1 0-1.697-.425L6.714 21.166a.437.437 0 0 1-.624.283A11.25 11.25 0 0 1 .001 11.253C.066 5.089 5.105.057 11.266.001a11.38 11.38 0 0 1 11.485 11.451z" />
    </svg>
  );
}

/** Behance mark: rounded square (currentColor) with the "Bē" glyph cut in the page background color. */
export function BehanceIcon({ glyphColor = "#f0ebe6", ...props }: IconProps & { glyphColor?: string }) {
  return (
    <svg viewBox="0 0 28 28" {...props}>
      <path fill="currentColor" d="M5 25.75c-1.105 0-2-.895-2-2V5c0-1.105.895-2 2-2h18.75c1.105 0 2 .895 2 2v18.75c0 1.105-.895 2-2 2z" />
      <path fill={glyphColor} d="M11.626 8.936c.718 0 1.408.286 1.916.793.508.509.793 1.198.793 1.917 0 .688-.265 1.348-.734 1.849.14.099.275.209.398.332.558.559.872 1.316.872 2.106 0 .789-.314 1.547-.872 2.105-.558.558-1.316.872-2.105.872H7.74a.7.7 0 0 1-.7-.7V9.636a.7.7 0 0 1 .7-.7zm5.618 3.703a3.36 3.36 0 0 1 5.13 2.891.7.7 0 0 1-.7.701h-4.53l.014.04a2.05 2.05 0 0 0 3.42.447.7.7 0 1 1 1.12.84 3.45 3.45 0 0 1-6.04-1.925l-.004-.075.004-.037c.004-.348.058-.696.17-1.031a3.35 3.35 0 0 1 1.416-1.851zM8.44 17.511h3.454a1.58 1.58 0 0 0 0-3.155H8.44zm10.871-3.935a2.06 2.06 0 0 0-2.167 1.254h3.701a2.05 2.05 0 0 0-1.534-1.254zM8.44 12.955h3.186a1.31 1.31 0 1 0 0-2.619H8.44zm12.698-2.948a.7.7 0 1 1 0 1.4h-4.287a.7.7 0 1 1 0-1.4z" />
    </svg>
  );
}

/* ---------- Nav "MENU +" plus (24 box, two 16.5px round-capped 2px strokes); rotates 45deg into an X when open ---------- */
export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.75 12h16.5" />
      <path d="M12 3.75v16.5" />
    </svg>
  );
}

/* ---------- Down arrow glyph used by the hero "View projects" text link (16px glyph in 24 box) ---------- */
export function ArrowDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path transform="translate(4 4)" d="M16 8l-1.41-1.41L9 12.17V0H7v12.17L1.42 6.58 0 8l8 8z" />
    </svg>
  );
}

/* ---------- Close (X) used in the service detail modal ---------- */
export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

/* ---------- Small tick used in the service detail bullet list ---------- */
export function TickIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 11 9" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 4.5l3 3L10 1" />
    </svg>
  );
}

/* ---------- Clock used in the service detail hours pill ---------- */
export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx={12} cy={12} r={10} />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export const PROCESS_ICONS = {
  search: SearchIcon,
  cube: CubeIcon,
  bulb: BulbIcon,
  check: CheckCircleIcon,
} as const;

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.53 3h3.03l-6.62 7.57L21.7 21h-6.1l-4.78-6.25L5.34 21H2.3l7.08-8.09L1.93 3h6.26l4.32 5.71L17.53 3Zm-1.06 16.2h1.68L7.6 4.7H5.8l10.67 14.5Z" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
    </svg>
  );
}

