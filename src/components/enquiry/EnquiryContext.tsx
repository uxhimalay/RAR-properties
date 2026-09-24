"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import { EnquiryDrawer } from "@/components/enquiry/EnquiryDrawer";

/* ------------------------------------------------------------------------------------------------
 * One enquiry drawer for the whole page. Any section opens it with `useEnquiry().open(subject)`,
 * optionally naming what the visitor was looking at ("Residential", "Price list", a service), which
 * the drawer shows as a chip and sends along with the message.
 * ---------------------------------------------------------------------------------------------- */

interface EnquiryApi {
  open: (subject?: string) => void;
  close: () => void;
  isOpen: boolean;
}

const EnquiryContext = createContext<EnquiryApi | null>(null);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; subject?: string }>({ open: false });
  const open = useCallback((subject?: string) => setState({ open: true, subject }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  const api = useMemo(() => ({ open, close, isOpen: state.open }), [open, close, state.open]);
  return (
    <EnquiryContext.Provider value={api}>
      {children}
      <AnimatePresence>{state.open && <EnquiryDrawer key="enquiry" subject={state.subject} onClose={close} />}</AnimatePresence>
    </EnquiryContext.Provider>
  );
}

export function useEnquiry(): EnquiryApi {
  const api = useContext(EnquiryContext);
  if (!api) throw new Error("useEnquiry must be used inside EnquiryProvider");
  return api;
}
