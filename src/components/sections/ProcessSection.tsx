import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProcessCard } from "@/components/sections/ProcessCard";
import { PROCESS_SECTION, PROCESS_STEPS } from "@/lib/content";

/**
 * "Clear Design Process" section (#design-process).
 *
 * Desktop (>= 1200): SectionHeading, 56px gap, then a 1317 x 331 row (gap 8) made of two halves
 * (each flex-1, gap 8) holding two 323 x 331 ProcessCards each.
 *
 * Tablet / phone (< 1200): 24px gap under the heading; the row and both halves become columns
 * with a 12px gap, so the four cards stack full width at 331px each.
 *
 * Cards have no appear animation; all motion is hover-driven inside ProcessCard.
 * No margins here: the page wrapper owns the spacing above/below.
 */

/** The four steps are rendered as two halves of two cards each (matches the original DOM). */
const HALVES = [PROCESS_STEPS.slice(0, 2), PROCESS_STEPS.slice(2, 4)];

export function ProcessSection() {
  return (
    <section
      id="design-process"
      className="section-width flex flex-col items-center gap-6 overflow-clip desktop:gap-14 desktop:py-[25px]"
    >
      <SectionHeading heading={PROCESS_SECTION.heading} subtitle={PROCESS_SECTION.subtitle} />

      {/* Content */}
      <div className="flex w-full flex-col items-start justify-center gap-3 desktop:flex-row desktop:gap-2">
        {HALVES.map((pair, index) => (
          <div
            key={index}
            className="flex w-full flex-col items-center justify-center gap-3 overflow-clip desktop:flex-1 desktop:flex-row desktop:gap-2"
          >
            {pair.map((step) => (
              <ProcessCard key={step.number} step={step} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProcessSection;
