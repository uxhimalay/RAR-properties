"use client";

import Image from "next/image";
import type { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/motion/FadeUp";
import { ArrowButton } from "@/components/ui/ArrowButton";
import type { Service } from "@/types/content";

interface ServiceRowProps {
  service: Service;
  onOpen: (service: Service) => void;
}

const EASE = "ease-[cubic-bezier(0.44,0,0.56,1)]";

/** Title / description type: 1.3 line-height and tighter tracking at rest, 1.2 + 80% ink on row hover. */
const DESKTOP_TYPE =
  "font-display font-normal leading-[1.3] text-[#453e3a] transition-all duration-500 group-hover:leading-[1.2] group-hover:tracking-[-0.2px] group-hover:text-[rgba(69,62,58,0.8)]";

/**
 * One row of the services list. The whole row is the click target (opens the detail modal)
 * and a hover `group` for the ArrowButton fly animation.
 *
 * Desktop (>= 1200): 180px row with a 1px bottom border. On hover the 269px image slides in from
 * the left (left -280px -> 0) while the row gains 270px of left padding so the text shifts right.
 *
 * Tablet / phone (< 1200): compact 105px row (title + arrow on one 40px line, description below),
 * no hover image.
 *
 * Both layouts render inside a single FadeUp; `hidden desktop:flex` / `flex desktop:hidden` pick one.
 */
export function ServiceRow({ service, onOpen }: ServiceRowProps) {
  const open = () => onOpen(service);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };
  const interactive = {
    role: "button" as const,
    tabIndex: 0,
    "aria-haspopup": "dialog" as const,
    onClick: open,
    onKeyDown,
  };

  return (
    <li className="w-full">
      <FadeUp className="w-full">
        {/* Desktop row */}
        <div
          {...interactive}
          className={cn(
            "group relative hidden h-[180px] w-full cursor-pointer items-center justify-end overflow-clip border-b border-[rgba(69,62,58,0.5)] pl-0 transition-[padding] duration-500 hover:pl-[270px] desktop:flex",
            EASE,
          )}
        >
          {/* service_img: parked off-canvas to the left, slides to left 0 on hover */}
          <div
            className={cn(
              "absolute left-[-280px] top-1/2 h-[180px] w-[269px] -translate-y-1/2 overflow-clip transition-[left] duration-500 group-hover:left-0",
              EASE,
            )}
          >
            <Image src={service.image} alt="" fill sizes="269px" className="object-cover" />
          </div>

          {/* service_text */}
          <div className="flex flex-1 items-start justify-between overflow-clip p-10">
            <div className="flex w-[661px] max-w-[64%] flex-col items-start gap-[10px] overflow-clip">
              <h3 className={cn(DESKTOP_TYPE, "text-[34px] tracking-[-0.4px]")}>{service.title}</h3>
              <p className={cn(DESKTOP_TYPE, "text-[18px] tracking-[-0.3px]")}>{service.description}</p>
            </div>
            {/* num: 100px tall at rest (arrow pinned to the top), collapses to 32px centred on hover */}
            <div className="flex h-[100px] max-w-[30%] flex-1 items-start justify-end gap-[10px] overflow-clip transition-all duration-500 group-hover:h-8 group-hover:items-center">
              <ArrowButton parentGroup />
            </div>
          </div>
        </div>

        {/* Tablet / phone row */}
        <div
          {...interactive}
          className="group flex h-[105px] w-full cursor-pointer flex-col gap-2 overflow-clip border-b border-[rgba(69,62,58,0.5)] pt-[22px] desktop:hidden"
        >
          <div className="flex h-10 w-full items-center justify-between">
            <h3 className="font-display text-[20px] font-normal leading-[1.2] tracking-[-0.2px] text-ink">{service.title}</h3>
            <ArrowButton parentGroup />
          </div>
          <p className="font-display text-[11px] font-normal leading-[1.2] tracking-[-0.2px] text-ink">{service.description}</p>
        </div>
      </FadeUp>
    </li>
  );
}

export default ServiceRow;
