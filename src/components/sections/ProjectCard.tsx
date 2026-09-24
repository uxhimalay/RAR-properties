import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UnderlineLink } from "@/components/ui/UnderlineLink";
import { ArrowButton } from "@/components/ui/ArrowButton";
import type { Project } from "@/types/content";

export type ProjectCardVariant = "responsive" | "desktop" | "mobile";

interface ProjectCardProps {
  project: Project;
  /**
   * responsive (default): 326px image below 1200px, 512px (583px when `tall`) at >= 1200px, gap 12 -> 16.
   * desktop: always the desktop metrics. mobile: always the tablet/phone metrics.
   */
  variant?: ProjectCardVariant;
  className?: string;
}

const DEFAULT_HREF = "/projects";

/** Image-box height per variant (the tablet/phone layout has no tall variant: every image is 326px). */
function imageHeightClass(variant: ProjectCardVariant, tall: boolean) {
  if (variant === "mobile") return "h-[326px]";
  if (variant === "desktop") return tall ? "h-[583px]" : "h-[512px]";
  return tall ? "h-[326px] desktop:h-[583px]" : "h-[326px] desktop:h-[512px]";
}

const cardGapClass: Record<ProjectCardVariant, string> = {
  responsive: "gap-3 desktop:gap-4",
  desktop: "gap-4",
  mobile: "gap-3",
};

const metaClass =
  "whitespace-pre font-display text-[12px] font-normal uppercase leading-[1.3] tracking-[-0.2px] text-ink";

/**
 * Featured project card. The whole <article> is the hover `group`:
 * image scales 1 -> 1.03 (0.5s), the title underline slides in and the arrow "flies" (ArrowButton parentGroup).
 * Desktop: 428 x 603 (tall card 428 x 674). Tablet/phone: full width x 413 (image 326 + gap 12 + info 75).
 */
export function ProjectCard({ project, variant = "responsive", className }: ProjectCardProps) {
  const href = project.href ?? DEFAULT_HREF;
  const tall = project.tall ?? false;

  return (
    <article className={cn("group flex w-full flex-col items-center overflow-clip", cardGapClass[variant], className)}>
      <Link
        href={href}
        aria-label={project.title}
        className={cn("relative block w-full overflow-clip rounded-[8px]", imageHeightClass(variant, tall))}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(min-width: 1200px) 31vw, 93vw"
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex w-full flex-col items-start gap-2 overflow-clip">
        <div className="flex w-full items-center justify-between">
          <UnderlineLink href={href} size="md">
            {project.title}
          </UnderlineLink>
          <ArrowButton href={href} parentGroup />
        </div>
        <div className="flex flex-col items-start gap-1">
          <p className={metaClass}>{project.category}</p>
          <p className={metaClass}>{project.meta}</p>
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
