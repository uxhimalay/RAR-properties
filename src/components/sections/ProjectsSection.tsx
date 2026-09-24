import { SectionHeading } from "@/components/ui/SectionHeading";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { FadeUp } from "@/components/motion/FadeUp";
import { PROJECTS, PROJECTS_SECTION } from "@/lib/content";
import { ProjectCard } from "@/components/sections/ProjectCard";

/**
 * "FEATURED PROJECTS" section.
 * Desktop (>= 1200): section-width column, gap 56; three cards in a row (flex-1 each, gap 16); centred "View more projects".
 * Tablet/phone (< 1200): gap 24; cards stacked full-width with gap 32, each with a FadeUp appear.
 *
 * A single DOM serves both layouts. The per-card FadeUp wrapper is neutralised at >= 1200px with
 * `!important` opacity/transform overrides (framer-motion writes inline styles, which only `!important`
 * stylesheet rules can beat), so desktop cards render statically as in the original while the
 * tablet/phone appear animation stays intact — without duplicating the cards/images in the DOM.
 */
export function ProjectsSection() {
  return (
    <section className="section-width flex flex-col items-center gap-6 overflow-clip desktop:gap-14">
      <SectionHeading heading={PROJECTS_SECTION.heading} subtitle={PROJECTS_SECTION.subtitle} subtitleMaxWidth={421} />

      <div className="flex w-full flex-col items-start gap-8 overflow-clip desktop:flex-row desktop:justify-center desktop:gap-4">
        {PROJECTS.map((project) => (
          <FadeUp
            key={project.title}
            className="w-full desktop:min-w-0 desktop:flex-1 desktop:opacity-100! desktop:transform-none!"
          >
            <ProjectCard project={project} />
          </FadeUp>
        ))}
      </div>

      <FadeUp className="flex justify-center">
        <UnderlineLink href={PROJECTS_SECTION.viewMore.href} size="md">
          {PROJECTS_SECTION.viewMore.label}
        </UnderlineLink>
      </FadeUp>
    </section>
  );
}

export default ProjectsSection;
