import Image from "next/image";
import { Fragment } from "react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Marquee } from "@/components/ui/Marquee";
import { SwapLink } from "@/components/ui/SwapLink";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { FOOTER } from "@/lib/content";

/**
 * Site footer — beige rounded block: heading + "get in touch" | 3 link columns, divider,
 * contact icon buttons + copyright, giant "ArcSphere Studio" running text, wide image.
 *
 * Desktop (>= 1200): 1416 x 1367 — padding-top 110, gap 40, radius 12. Text row is
 * space-between (Left Text max 672 | footer-links gap 48). Icon buttons are 48 x 48 and grow
 * on hover to reveal their label. Running text 240px in a 310px strip (80px padding-top).
 *
 * Tablet / phone (< 1200): padding-top 32, gap 24, radius 8. Everything stacks in one column;
 * link columns are space-between across the full width; the contact buttons become a vertical
 * list with 16px icons and always-visible labels (measured from the live site's DOM tree).
 * Running text 80px inside an 80px-tall strip; image aspect 2.769.
 */

const ICONS = {
  mail: MailIcon,
  phone: PhoneIcon,
  pin: MapPinIcon,
} as const;

type IconKey = keyof typeof ICONS;

const RUNNING_TEXT_DESKTOP =
  "whitespace-pre font-display text-[240px] font-extrabold leading-[230.4px] tracking-[-9.6px] text-ink";
const RUNNING_TEXT_MOBILE =
  "whitespace-pre font-display text-[80px] font-extrabold leading-[76.8px] tracking-[-3.2px] text-ink";

/** The marquee duplicates its children; three copies of the phrase keep the track wider than any viewport. */
function RunningTextItems({ className }: { className: string }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        // Horizontal padding only: the original strip measures exactly the text's line-height (230 / 77px).
        <div key={i} className="px-1">
          <p className={className}>{FOOTER.runningText}</p>
        </div>
      ))}
    </>
  );
}

interface IconButtonProps {
  icon: IconKey;
  label: string;
  href: string;
}

/**
 * Contact icon button.
 * Desktop: 48 x 48 (padding 12, 24px icon, radius 15). The label sits in a clipped max-width-0 wrapper
 * (its 12px gap is inner padding so the collapsed button stays exactly 48 wide) and expands with a
 * 500ms width + opacity transition on hover — an approximation of the original per-character fade.
 * Tablet / phone: 16px icon, 8px gap, 2px padding, label always visible (21px row).
 */
function IconButton({ icon, label, href }: IconButtonProps) {
  const Icon = ICONS[icon];
  return (
    <a
      href={href}
      className="group flex items-center gap-2 overflow-hidden rounded-[15px] p-[2px] desktop:h-12 desktop:gap-0 desktop:p-3"
    >
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-icon desktop:h-6 desktop:w-6" />
      <span className="block overflow-hidden transition-[max-width,opacity] duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] desktop:max-w-0 desktop:opacity-0 desktop:group-hover:max-w-[220px] desktop:group-hover:opacity-100">
        <span className="block whitespace-pre font-display text-[14px] font-normal leading-[16.8px] text-icon desktop:pl-3">
          {label}
        </span>
      </span>
    </a>
  );
}

export function Footer() {
  return (
    <footer
      id="footer"
      className="flex w-full flex-col items-center gap-6 overflow-clip rounded-[8px] bg-footer pt-8 desktop:gap-10 desktop:rounded-[12px] desktop:pt-[110px]"
    >
      {/* Container Text: padding 0 12 (mobile) / 0 40 (desktop) */}
      <div className="flex w-full items-center justify-center gap-[10px] overflow-clip px-3 desktop:px-10">
        {/* Wrapper: gap 24 / 108 */}
        <div className="flex w-full flex-col items-start gap-6 desktop:gap-[108px]">
          {/* Text: column (mobile) / space-between row (desktop) */}
          <div className="flex w-full flex-col items-start gap-6 overflow-clip desktop:flex-row desktop:justify-between desktop:gap-0">
            {/* Left Text: gap 24 / 64, max-width 672 on desktop */}
            <div className="flex w-full flex-col items-start gap-6 desktop:max-w-[672px] desktop:flex-1 desktop:gap-16">
              <h3 className="whitespace-pre-wrap font-display text-[24px] font-medium uppercase leading-[28.8px] tracking-[-0.24px] text-ink desktop:text-[40px] desktop:leading-[48px] desktop:tracking-[-1.6px]">
                {FOOTER.heading}
              </h3>

              {/* "get in touch": 16px text + 2px bar below 1200, 18px text + 3px bar on desktop */}
              <FadeUp className="flex desktop:hidden">
                <UnderlineLink href={FOOTER.cta.href} size="md">
                  {FOOTER.cta.label}
                </UnderlineLink>
              </FadeUp>
              <FadeUp className="hidden desktop:flex">
                <UnderlineLink href={FOOTER.cta.href} size="lg">
                  {FOOTER.cta.label}
                </UnderlineLink>
              </FadeUp>
            </div>

            {/* footer-links: space-between across the full width (mobile) / gap 48 (desktop) */}
            <div className="flex w-full items-start justify-between overflow-clip desktop:w-auto desktop:justify-start desktop:gap-12">
              {FOOTER.linkGroups.map((group, gi) => (
                /*
                  Links: 12px (mobile) / 14px (desktop), rgba(79,71,66,0.8). The font size is set on the column
                  and inherited by SwapLink: passing `text-[12px]` through its className would make the class
                  merger drop SwapLink's `leading-[1.1]` (font-size shorthand conflicts with line-height).
                  The original keeps a fixed 22px row at both sizes.
                */
                <div key={gi} className="flex flex-col items-start gap-2 overflow-clip text-[12px] desktop:text-[14px]">
                  {group.links.map((link) => (
                    <FadeUp key={link.label}>
                      <SwapLink
                        href={link.href}
                        className="text-[rgba(79,71,66,0.8)]"
                        style={{ height: 22, fontSize: "inherit" }}
                      >
                        {link.label}
                      </SwapLink>
                    </FadeUp>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Footer bottom: divider + (icons, copyright) */}
          <div className="flex w-full flex-col items-center gap-4">
            <div aria-hidden="true" className="h-px w-full bg-bg" />

            {/*
              Mobile: column, gap 12. Desktop: 29px-tall space-between row — the 48px icon buttons
              overflow it vertically exactly as on the original, so overflow stays visible there.
            */}
            <div className="flex w-full flex-col items-start gap-3 overflow-clip desktop:h-[29px] desktop:flex-row desktop:items-center desktop:justify-between desktop:gap-0 desktop:overflow-visible">
              {/* icons-group: vertical list (mobile) / 180 x 48 row with 2px separators (desktop) */}
              <div className="flex flex-col items-start gap-3 overflow-clip desktop:flex-row desktop:items-center desktop:justify-center desktop:gap-2">
                {FOOTER.iconButtons.map((item, i) => {
                  const icon = item.icon as IconKey;
                  if (!(icon in ICONS)) return null;
                  return (
                    <Fragment key={item.label}>
                      {i > 0 && <span aria-hidden="true" className="hidden h-6 w-[2px] shrink-0 bg-[#ccc] desktop:block" />}
                      <IconButton icon={icon} label={item.label} href={item.href} />
                    </Fragment>
                  );
                })}
              </div>

              <p className="whitespace-pre font-display text-[12px] font-medium capitalize leading-[15.6px] tracking-[-0.3px] text-[rgba(85,77,72,0.6)] desktop:text-[16px] desktop:leading-[20.8px]">
                {FOOTER.copyright}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Running Text: 80px-tall clipped strip (mobile) / 80px padding-top + 230px text (desktop) */}
      <div className="flex h-20 w-full items-center justify-center overflow-clip desktop:h-auto desktop:pt-20">
        <FadeUp className="w-full">
          {/* Desktop: 240px, gap 20 */}
          <Marquee speed={100} gap={20} className="hidden desktop:block">
            <RunningTextItems className={RUNNING_TEXT_DESKTOP} />
          </Marquee>
          {/* Tablet / phone: 80px, gap 24 */}
          <Marquee speed={100} gap={24} className="desktop:hidden">
            <RunningTextItems className={RUNNING_TEXT_MOBILE} />
          </Marquee>
        </FadeUp>
      </div>

      {/* Footer image: 1416 x 474 (desktop) / aspect 2.769 (mobile), natural 1728 x 624 */}
      <div className="relative w-full overflow-clip aspect-[2.76923] desktop:aspect-[2.98755]">
        <Image src={FOOTER.image} alt="" fill sizes="100vw" className="object-cover" />
      </div>
    </footer>
  );
}

export default Footer;
