import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ABOUT } from "@/lib/content";

/**
 * About section ("Designing Timeless Spaces With Purpose").
 *
 * Desktop (>= 1200): 3-column row, 493px tall — left image column (28%, image top-aligned),
 * centred SectionHeading (464px, max 35%), right image column (28%, image bottom-aligned).
 * Both images are 394px tall so they are offset by 99px.
 *
 * Tablet / phone (< 1200): stacked column, gap 24px — SectionHeading then only the RIGHT image
 * at full width, 345px tall. The left image is hidden.
 *
 * No margins here: the page wrapper owns the 80px / 48px gap to the StatsTicker below.
 */
export function AboutSection() {
  return (
    <section
      id="about-section"
      className="section-width flex flex-col items-center gap-6 overflow-clip desktop:h-[493px] desktop:flex-row desktop:justify-between desktop:gap-0"
    >
      {/* Left image column: desktop only, image sits at the TOP of the 493px column */}
      <div className="hidden w-[28%] flex-col items-center justify-start overflow-clip desktop:flex desktop:h-full">
        <div className="relative h-[394px] w-full overflow-clip rounded-[8px]">
          <Image
            src={ABOUT.leftImage}
            alt="Living room seen from above with a sofa, cushions and a round wooden side table"
            fill
            sizes="(min-width: 1200px) 26vw, 93vw"
            className="object-cover"
          />
        </div>
      </div>

      <SectionHeading
        heading={ABOUT.heading}
        subtitle={ABOUT.paragraph}
        subtitleMaxWidth={464}
        className="w-full desktop:w-[464px] desktop:max-w-[35%]"
      />

      {/* Right image column: full width below 1200; on desktop 28% column with the image at the BOTTOM */}
      <div className="flex w-full flex-col items-center justify-end overflow-clip desktop:h-full desktop:w-[28%]">
        <div className="relative h-[345px] w-full overflow-clip rounded-[8px] desktop:h-[394px]">
          <Image
            src={ABOUT.rightImage}
            alt="Person walking past a dark wooden dining table and an arc floor lamp in a bright room"
            fill
            sizes="(min-width: 1200px) 26vw, 93vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
