"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteContent } from "@/lib/cms/schema";

/* ------------------------------------------------------------------------------------------------
 * The content document, read on the server for the request and handed to every client section
 * through this context, so the animated components keep working exactly as before and simply read
 * their copy and photos from here instead of from constants.
 * ---------------------------------------------------------------------------------------------- */

const SiteContentContext = createContext<SiteContent | null>(null);

export function SiteContentProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContent {
  const c = useContext(SiteContentContext);
  if (!c) throw new Error("useSiteContent must be used inside SiteContentProvider");
  return c;
}
