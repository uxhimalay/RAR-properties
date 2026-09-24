import Image from "next/image";
import { PROCESS_ICONS } from "@/components/icons";
import type { ProcessStep } from "@/types/content";

/**
 * One "Clear Design Process" card. Pure CSS hover (the card itself is the `group`, so the whole
 * 323 x 331 box is the hover target and nothing can flicker while children move around inside it).
 *
 * Idle:  photo, icon box top-right (12px inset), title + description bottom-left over a
 *        0deg rgba(0,0,0,0.72) -> transparent gradient with a 7.5px backdrop blur.
 * Hover: frosted grid overlay slides up from below (2 vertical + 2 horizontal 1px lines 150px apart,
 *        306 -> 313px circle, tag top-right 16 -> 14px, number bottom-left), the icon box slides to the
 *        centre (18px above it), the bottom panel grows to 155px, the title slides to the centre and the
 *        description slides 141px left while fading out.
 *
 * All transitions 0.5s cubic-bezier(0.44, 0, 0.56, 1).
 *
 * Implementation notes (deviations from the literal Framer DOM, same visual result):
 * - `justify-content` / `align-items` cannot animate, so the icon and title are centred with
 *   zero-width flex spacers whose `flex-grow` animates 0 -> 1 (flex-grow IS animatable).
 * - `height: auto` cannot animate, so the bottom panel uses `min-h-[90px]` -> `min-h-[155px]`
 *   (90px is the measured idle height: 12 + 28.8 + 8 + 28.8 + 12).
 * - The gradient cannot animate to `none`, so it lives on a separate layer that fades to opacity 0.
 */

/** Every hover transition on the card: 0.5s cubic-bezier(0.44, 0, 0.56, 1). */
const EASE = "duration-500 ease-[cubic-bezier(0.44,0,0.56,1)]";

/** 1px grid line rgb(240,235,230), 45% alpha while the card is hovered. */
const GRID_LINE = `h-full w-px bg-[#f0ebe6] transition-colors ${EASE} group-hover:bg-[rgba(240,235,230,0.45)]`;

/** Two lines 150px apart, 531px long, centred on the card. A rotated copy provides the horizontal pair. */
const GRID_LINES =
  "absolute left-1/2 top-1/2 flex h-[531px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[150px]";

/** Zero-width flex spacer whose flex-grow goes 0 -> 1 on hover, sliding its sibling towards the centre. */
const SLIDE_SPACER = `grow-0 basis-0 transition-[flex-grow] ${EASE} group-hover:grow`;

export interface ProcessCardProps {
  step: ProcessStep;
}

export function ProcessCard({ step }: ProcessCardProps) {
  const Icon = PROCESS_ICONS[step.icon];

  return (
    <div className="group relative flex h-[331px] w-full flex-col items-center justify-end gap-3 overflow-hidden rounded-[8px] desktop:flex-1">
      <Image
        src={step.image}
        alt=""
        fill
        sizes="(min-width: 1200px) 23vw, 93vw"
        className="rounded-[8px] object-cover"
      />

      {/* GRID overlay: idle sits fully below the card, hover covers it */}
      <div
        className={`absolute inset-0 translate-y-full overflow-clip bg-[rgba(255,255,255,0.03)] backdrop-blur-[2px] transition-transform ${EASE} group-hover:translate-y-0`}
      >
        {/* 2 vertical lines */}
        <div className={GRID_LINES}>
          <div className={GRID_LINE} />
          <div className={GRID_LINE} />
        </div>
        {/* 2 horizontal lines (rotated copy) */}
        <div className={`${GRID_LINES} rotate-90`}>
          <div className={GRID_LINE} />
          <div className={GRID_LINE} />
        </div>
        {/* circle 306 -> 313 */}
        <div
          className={`absolute left-1/2 top-1/2 h-[306px] w-[306px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.5px] border-[#f0ebe6] transition-all ${EASE} group-hover:h-[313px] group-hover:w-[313px] group-hover:border-[rgba(240,235,230,0.45)]`}
        />
        {/* tag top-right, 16 -> 14px */}
        <p
          className={`absolute right-4 top-4 font-display text-[16px] font-medium leading-[1.2] text-[#f0ebe6] transition-[font-size] ${EASE} group-hover:text-[14px]`}
        >
          {step.tag}
        </p>
        {/* number bottom-left */}
        <p className="absolute bottom-4 left-4 font-display text-[16px] font-medium leading-[1.2] text-[#f0ebe6]">
          {step.number}
        </p>
      </div>

      {/* ICON container: idle 72px strip with the icon at the right; hover whole card, icon centred 18px above centre */}
      <div
        className={`absolute inset-x-0 top-0 flex h-[72px] translate-y-0 items-center overflow-clip p-3 transition-all ${EASE} group-hover:h-full group-hover:-translate-y-[18px]`}
      >
        <span className="grow basis-0" />
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#f0ebe6] p-2">
          <Icon aria-hidden="true" className="h-8 w-8 text-[#4c443f]" />
        </div>
        <span className={SLIDE_SPACER} />
      </div>

      {/* BOTTOM content: idle 90px gradient + blur band, title + description left; hover 155px, no gradient/blur, title centred */}
      <div
        className={`relative isolate flex min-h-[90px] w-full flex-col items-start gap-2 p-3 backdrop-blur-[7.5px] transition-all ${EASE} group-hover:min-h-[155px] group-hover:backdrop-blur-[0px]`}
      >
        {/* gradient layer, fades out on hover */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 -z-10 transition-opacity ${EASE} group-hover:opacity-0`}
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)" }}
        />
        <div className="flex w-full items-center">
          <span className={SLIDE_SPACER} />
          <p className="shrink-0 whitespace-pre text-center font-inter text-[24px] font-medium uppercase leading-[1.2] tracking-[-0.96px] text-[#e2dacf]">
            {step.title}
          </p>
          <span className="grow basis-0" />
        </div>
        <p
          className={`max-w-[282px] font-inter text-[12px] font-normal capitalize leading-[1.2] tracking-[-0.24px] text-[#e2dacf] translate-x-0 transition-[translate,opacity] ${EASE} group-hover:-translate-x-[141px] group-hover:opacity-0`}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}

export default ProcessCard;
