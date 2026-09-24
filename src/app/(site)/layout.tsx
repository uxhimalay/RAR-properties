import type { ReactNode } from "react";
import { LenisProvider } from "@/components/LenisProvider";
import { EnquiryProvider } from "@/components/enquiry/EnquiryContext";
import { SiteContentProvider } from "@/lib/cms/context";
import { readContent } from "@/lib/cms/store";

/**
 * The public site: reads the content document for this request and provides it, the smooth scroll
 * and the enquiry drawer to every page in the group. The admin lives outside this group and gets
 * none of that.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const content = await readContent();
  return (
    <SiteContentProvider content={content}>
      <LenisProvider>
        <EnquiryProvider>{children}</EnquiryProvider>
      </LenisProvider>
    </SiteContentProvider>
  );
}
