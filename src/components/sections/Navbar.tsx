"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/motion/FadeUp";
import { InstagramIcon, LinkedinIcon, PlusIcon, XIcon } from "@/components/icons";
import { MENU_LINKS, NAV_BRAND, NAV_CTA, SITE_NAME } from "@/lib/content";
import { useSiteContent } from "@/lib/cms/context";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";

/** Intro delay shared by the brand and the menu button (no stagger on the reference). */
const INTRO_DELAY = 0.2;
/** Shared by the panel expansion, the background fade and the plus -> cross rotation. */
const EASE_MENU = { duration: 0.4, ease: "easeInOut" } as const;
/** Menu links slide up out of their clipped rows once the panel starts opening. */
const EASE_REVEAL: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Past this scroll the bar gets its backdrop and compacts. */
const SCROLLED_AT = 40;

/** Maps contact.socials[].name (content document) -> round icon button at the bottom of the open menu. */
const SOCIAL_ICONS: Record<string, (className: string) => ReactNode> = {
  InstagramLogo: (c) => <InstagramIcon className={c} />,
  LinkedinLogo: (c) => <LinkedinIcon className={c} />,
  XLogo: (c) => <XIcon className={c} />,
};

/**
 * Site navbar, modelled on the project reference's nav (measured 2026-09-17), now fixed
 * so it is there on every section, not only over the hero:
 * - At the top of the page it is transparent over the hero, as the reference. A page that does not
 *   open on a dark photo passes `solid`, so the bar keeps its backdrop from the first pixel and its
 *   white type is never left on a pale background.
 * - Once scrolled past SCROLLED_AT it compacts (padding 20 -> 12) and gains a dark blurred backdrop
 *   with a gold hairline beneath, so it reads on the white and cream sections as well as the dark.
 * - Brand on the left; on the right a gold "Enquire" pill (opens the enquiry drawer) and "MENU +".
 * - Open: the nav turns black and grows downwards with the centred menu links (in-page anchors,
 *   every one of which has a target) and the round social buttons; the plus rotates into a cross.
 * Container padding 20px (40px sides from 1200px), max-width 1600px.
 */
export function Navbar({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(solid);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(solid || y > SCROLLED_AT));
  const enquiry = useEnquiry();
  const { contact } = useSiteContent();
  const close = () => setOpen(false);

  // Escape closes the menu, mirroring the cross button.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const backdrop = open ? "rgba(0, 0, 0, 1)" : scrolled ? "rgba(0, 0, 0, 0.72)" : "rgba(0, 0, 0, 0)";

  return (
    <motion.nav
      aria-label="Main"
      data-scrolled={scrolled || undefined}
      className={cn("fixed inset-x-0 top-0 z-50 flex justify-center text-white transition-[backdrop-filter] duration-300", (scrolled || open) && "backdrop-blur-md")}
      initial={false}
      animate={{ backgroundColor: backdrop }}
      transition={EASE_MENU}
    >
      {/* gold hairline once the bar has a backdrop */}
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ backgroundColor: "rgba(201, 169, 98, 0.45)" }} initial={false} animate={{ opacity: scrolled && !open ? 1 : 0 }} transition={{ duration: 0.3 }} />

      {/* Container */}
      <motion.div className="flex w-full max-w-[1600px] flex-col items-center gap-[10px] px-5 desktop:px-10" initial={false} animate={{ paddingTop: scrolled && !open ? 12 : 20, paddingBottom: scrolled && !open ? 12 : 20 }} transition={{ duration: 0.3 }}>
        {/* Navbar row: brand | Enquire, MENU + */}
        <div className="flex w-full items-center justify-between">
          <FadeUp onMount delay={INTRO_DELAY}>
            <Link href="/" aria-label={SITE_NAME} onClick={close} className="hit-slop block whitespace-pre font-inter text-[22px] font-semibold leading-[1.3] tracking-[-0.03em] outline-none">
              {NAV_BRAND}
            </Link>
          </FadeUp>

          <FadeUp onMount delay={INTRO_DELAY} className="flex items-center gap-4 tablet:gap-6">
            <button
              type="button"
              onClick={() => {
                close();
                enquiry.open();
              }}
              className="flex h-10 cursor-pointer items-center rounded-full bg-[var(--color-gold)] px-5 font-inter text-[11px] font-medium uppercase leading-none tracking-[0.44px] text-black outline-none transition-colors duration-300 hover:bg-[var(--color-gold-light)] focus-visible:bg-[var(--color-gold-light)]"
            >
              {NAV_CTA}
            </button>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((v) => !v)}
              className="hit-slop flex h-10 cursor-pointer items-center justify-center gap-1 outline-none"
            >
              <span className="font-inter text-[16px] font-medium uppercase leading-none tracking-[-0.03em] desktop:text-[15px]">Menu</span>
              {/* 20px plus: rotates into a cross while the menu is open */}
              <motion.span aria-hidden className="block h-5 w-5" initial={false} animate={{ rotate: open ? 45 : 0 }} transition={EASE_MENU}>
                <PlusIcon className="h-5 w-5" />
              </motion.span>
            </button>
          </FadeUp>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id="site-menu"
              key="site-menu"
              className="flex w-full flex-col items-center gap-[10px] overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={EASE_MENU}
            >
              {/* Links: centred column, padding 40px (24px below 1200px); plain anchors so the page's
                  sticky-safe anchor handler (LenisProvider) glides to each section */}
              <ul className="flex w-full flex-col items-center p-6 desktop:p-10">
                {MENU_LINKS.map((link, index) => (
                  <li key={link.href} className="flex w-full flex-col items-center overflow-clip">
                    <motion.div initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.15 + index * 0.06, ease: EASE_REVEAL }}>
                      <a href={link.href} onClick={close} className="block whitespace-pre font-display text-[40px] font-semibold leading-[1.2] tracking-[-0.03em] outline-none transition-colors duration-300 hover:text-[var(--color-gold-light)] focus-visible:text-[var(--color-gold-light)] desktop:text-[56px]">
                        {link.label}
                      </a>
                    </motion.div>
                  </li>
                ))}
              </ul>

              {/* Contact: 48px round social buttons, gap 8px, padding 20px */}
              <div className="flex w-full items-center justify-center gap-2 p-5">
                {contact.socials.map((social) => {
                  const render = SOCIAL_ICONS[social.name];
                  if (!render) return null;
                  return (
                    <a key={social.name} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 p-2 outline-none transition-colors duration-300 hover:bg-[var(--color-gold)] hover:text-black focus-visible:bg-[var(--color-gold)] focus-visible:text-black">
                      {render("h-5 w-5")}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.nav>
  );
}

export default Navbar;
