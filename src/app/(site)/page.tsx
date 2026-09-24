import { Navbar } from "@/components/sections/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProjectMarqueeSection } from "@/components/sections/ProjectMarqueeSection";
import { SteppedPanelSection } from "@/components/sections/SteppedPanelSection";
import { CategoryPanelContent } from "@/components/sections/CategoryPanelContent";
import { DealsPanelContent } from "@/components/sections/DealsPanelContent";
import { ServicesRail } from "@/components/sections/ServicesRail";
import { ScatterCtaSection } from "@/components/sections/ScatterCtaSection";
import { PartnersRibbon } from "@/components/sections/PartnersRibbon";
import { StatementSection } from "@/components/sections/StatementSection";
import { SiteFooter } from "@/components/sections/SiteFooter";

/**
 * Page assembly.
 * The nav + hero block is full-bleed: the hero fills the viewport edge to edge and the navbar is laid
 * over its top edge (absolute). The project marquee (the project reference's black band carrying
 * its 3D perspective panels) is the second section, also full-bleed edge to edge; on
 * desktop it rises over the pinned hero, which fades and scales down as it is covered.
 * The third section is the stepped white panel from the project reference carrying the category header, tabs
 * and dealt cards; it rises over the pinned marquee, which fades and scales down as it is covered.
 * The fourth is the same panel mirrored, black, rising over the pinned third the same way. The fifth
 * is the same panel again without a notch, rising over the pinned fourth the same way; inside it a
 * stage pins for a few viewports: the slow ambient video, and the agency's services on a rail that
 * arrives once the section is fully on screen and then travels sideways with the scroll.
 * After the pinned block come two sections built to the project reference: the stack of
 * photos that scatters as its stage is scrolled through, revealing the invitation to book a visit,
 * and the footer. The original Framer content column (projects, services, expertise, process,
 * reviews, quote, contact, footer) was removed from the page on 2026-09-19 at the user's request; the
 * components are still in src/components/sections.
 */
/** Rendered at request time so a save in the admin is live on the next load. */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main id="top" className="flex w-full flex-col items-center overflow-clip">
      <div className="relative w-full">
        <Navbar />
        <HeroSection />
      </div>
      {/* Marquee + stepped panel share one block: the marquee is sticky inside it, so it stays pinned
          exactly while the stepped panel rises over it and releases when the block ends. The marquee's
          -100dvh pairs with the hero header's 200dvh + 450px height (it rises over the pinned hero the
          same way), and z-10 keeps it above the hero's own z-[3]/z-[4] layers. */}
      <div className="relative w-full">
        <ProjectMarqueeSection className="z-10 desktop:-mt-[100dvh]" />
        {/* Third: the stepped white panel (notch top-right) with the category header, tabs and cards.
            Pinned so the fourth can rise over it while its content fades, like the band under it.
            It holds for a beat once it lands (`dwell`) so the cards can be read before the black
            panel starts rising; without it the takeover began the instant the panel arrived. */}
        <SteppedPanelSection id="categories" pinned dwell={1} dwellPhone={0.6} fade="content" className="z-20" aria-label="Project categories">
          <CategoryPanelContent />
        </SteppedPanelSection>
        {/* Fourth: the same panel mirrored (notch top-left) and black, carrying the hot-deals header
            on its right and the deals bento. It rises over the third's white, which stays as its
            backdrop while the third's content fades. Pinned in turn so the fifth can rise over it. */}
        <SteppedPanelSection id="hot-deals" notch="left" notchScale={0.6} tone="black" pinned fade="content" className="z-30" aria-label="Hot deals">
          <DealsPanelContent />
        </SteppedPanelSection>
        {/* Fifth: the panel with a straight top edge. It arrives with the same closing insets and
            rises over the fourth's black, which stays as its backdrop while the deals fade; then its
            stage (video + services rail) pins while the rail scrolls through. Last in the block, so
            every pin releases when it ends. */}
        <SteppedPanelSection id="services" notch="none" className="z-40" contentClassName="relative" aria-label="Services">
          <ServicesRail />
        </SteppedPanelSection>
      </div>
      {/* Developers we work with: a quiet ribbon of names, managed in the admin. */}
      <PartnersRibbon />
      {/* The statement: a photograph, a line, and the name set across the bottom
          (built to an earlier project reference; see docs/research/components/project-statement-earlier.spec.md). */}
      <StatementSection />
      {/* The photo stack that scatters with the scroll, then the invitation to book a visit. */}
      <ScatterCtaSection />
      <SiteFooter />
    </main>
  );
}
