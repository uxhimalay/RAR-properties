"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PillButton } from "@/components/ui/PillButton";
import { ClockIcon, CloseIcon, MapPinIcon, TickIcon } from "@/components/icons";
import { SERVICE_DETAIL_CTA } from "@/lib/content";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import type { Service, ServiceDetail } from "@/types/content";

interface ServiceModalProps {
  service: Service;
  onClose: () => void;
}

/** CSS `ease` as a bezier so the 0.3s fade/scale matches the original's `ease` timing. */
const EASE = [0.25, 0.1, 0.25, 1] as const;
const TRANSITION = { duration: 0.3, ease: EASE };

const BODY_TEXT = "font-display text-[14px] font-medium leading-[1.2] tracking-[-0.2px] text-[#453e3a]";
const META_TEXT = "font-display text-[14px] font-normal leading-[1.2] text-[#f0ebe6]";

/**
 * Service detail pop-up (576 x 792 on desktop, max 92vw on phone), rendered through a portal to
 * <body> so it sits above every section at z-50. Backdrop fades 0 -> 1; the card fades and scales
 * 0.96 -> 1. Centring uses motion x/y "-50%" so the scale composes with the translate.
 *
 * Closes on the X button, a backdrop click, or Escape. Body scroll is intentionally NOT locked.
 * Meant to be rendered inside an `AnimatePresence` so the exit animation plays.
 */
export function ServiceModal({ service, onClose }: ServiceModalProps) {
  const detail: ServiceDetail = service.detail ?? {
    title: service.title,
    hours: "",
    location: "",
    description: service.description,
    bullets: [],
    summary: "",
    price: "",
  };
  const panelRef = useRef<HTMLDivElement>(null);
  const enquiry = useEnquiry();

  // Escape closes
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Move focus into the dialog on open, give it back to the opener on close
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });
    return () => opener?.focus({ preventScroll: true });
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* backdrop */}
      <motion.div
        aria-hidden
        className="fixed inset-0 z-50 bg-[rgba(24,24,24,0.4)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={TRANSITION}
        onClick={onClose}
      />

      {/* card */}
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={detail.title}
        tabIndex={-1}
        className="fixed left-1/2 top-1/2 z-50 flex w-[576px] max-w-[92vw] flex-col items-center gap-[10px] overflow-clip rounded-[8px] bg-[#f0ebe6] p-2 outline-none"
        initial={{ opacity: 0, scale: 0.96, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.96, x: "-50%", y: "-50%" }}
        transition={TRANSITION}
      >
        {/* PopUp-Img-section 560 x 415 */}
        <div className="relative w-full overflow-hidden rounded-[8px]" style={{ aspectRatio: "560 / 415" }}>
          <Image
            src={detail.image ?? service.image}
            alt={detail.title}
            fill
            sizes="(min-width: 640px) 560px, 92vw"
            className="object-cover"
          />

          {/* card-overlay: transparent -> black gradient with the title + hours/location pinned to the bottom */}
          <div
            className="absolute inset-0 flex flex-col justify-end rounded-[8px] backdrop-blur-[2px]"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%)" }}
          >
            <div className="flex w-full flex-col items-start gap-[10px] p-4">
              <p className="font-display text-[24px] font-medium uppercase leading-[1.1] tracking-[-0.2px] text-white">{detail.title}</p>
              <div className="flex items-center gap-3 overflow-clip">
                <div className="flex items-center gap-2 rounded-[15px] p-[2px]">
                  <ClockIcon className="h-4 w-4 text-[#f0ebe6]" />
                  <p className={META_TEXT}>{detail.hours}</p>
                </div>
                <div className="h-4 w-[2px] bg-[#ccc]" />
                <div className="flex items-center gap-2 rounded-[15px] p-[2px]">
                  <MapPinIcon className="h-4 w-4 text-[#f0ebe6]" />
                  <p className={META_TEXT}>{detail.location}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[100px] bg-[rgba(255,255,255,0.16)] p-2 outline-none backdrop-blur-[15px] transition-colors hover:bg-[rgba(255,255,255,0.3)]"
          >
            <CloseIcon className="h-4 w-4 text-[#f0ebe6]" />
          </button>
        </div>

        {/* content 560 x 351 */}
        <div className="flex w-full flex-col items-start gap-6 overflow-clip p-3">
          <p className={BODY_TEXT}>{detail.description}</p>

          {/* Includes-section */}
          <div className="flex w-full flex-col gap-3">
            <h3 className={cn(BODY_TEXT, "capitalize")}>includes</h3>
            <div className="flex w-full flex-col gap-[10px]">
              {detail.bullets.map((bullet) => (
                <div key={bullet} className="flex items-center gap-2 p-[2px]">
                  <TickIcon className="h-[9px] w-[11px] shrink-0 text-ink" />
                  <p className="font-display text-[13px] font-normal leading-[1.2] tracking-[-0.2px] text-[#453e3a]">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          <p className={BODY_TEXT}>{detail.summary}</p>

          {/* Price + Button */}
          <div className="flex w-full items-center gap-[10px]">
            <div className="flex flex-1 flex-col items-start gap-1">
              <h3 className="font-display text-[12px] font-normal capitalize leading-[1.2] tracking-[-0.2px] text-[#453e3a]">starting from</h3>
              <p className="font-display text-[16px] font-medium leading-[1.2] tracking-[-0.2px] text-[#453e3a]">{detail.price}</p>
            </div>
            <PillButton variant="dark" size="popup" style={{ color: "#efede9" }} onClick={() => { onClose(); enquiry.open(detail.title); }}>
              {SERVICE_DETAIL_CTA.label}
            </PillButton>
          </div>
        </div>
      </motion.div>
    </>,
    document.body,
  );
}

export default ServiceModal;
