"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SERVICES, SERVICES_SECTION } from "@/lib/content";
import type { Service } from "@/types/content";
import { ServiceRow } from "./ServiceRow";
import { ServiceModal } from "./ServiceModal";

/**
 * "Our Services" section: centred heading + a 6-row list (1317 x 1080 on desktop, 6 x 180px rows).
 * Hovering a row slides its image in; clicking (or Enter/Space) opens the ServiceModal for that
 * service. Only one modal can be open at a time; it lives in `AnimatePresence` so it animates out.
 *
 * Below 1200px the rows are compact and separated by an 8px gap in addition to their border.
 */
export function ServicesSection() {
  const [active, setActive] = useState<Service | null>(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="services" className="section-width flex flex-col items-center gap-14 overflow-clip">
      <SectionHeading heading={SERVICES_SECTION.heading} subtitle={SERVICES_SECTION.subtitle} />

      {/* service_list */}
      <ul className="flex w-full flex-col items-center gap-2 overflow-hidden desktop:gap-0">
        {SERVICES.map((service) => (
          <ServiceRow key={service.title} service={service} onOpen={setActive} />
        ))}
      </ul>

      <AnimatePresence>
        {active ? <ServiceModal key={active.title} service={active} onClose={close} /> : null}
      </AnimatePresence>
    </section>
  );
}

export default ServicesSection;
