"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LABEL } from "@/components/admin/ui";

/* ------------------------------------------------------------------------------------------------
 * The admin frame: a slim left rail with one entry per section of the page (in page order), the
 * library and the import at the bottom; the screen on the right. Gold marks where you are.
 * ---------------------------------------------------------------------------------------------- */

export const ADMIN_NAV: { href: string; label: string; group?: string }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/hero", label: "Hero", group: "Sections" },
  { href: "/admin/work", label: "Work band" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/deals", label: "Hot deals" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/statement", label: "Statement" },
  { href: "/admin/visit", label: "Book a visit" },
  { href: "/admin/footer", label: "Footer & contact" },
  { href: "/admin/properties", label: "Properties", group: "Listings" },
  { href: "/admin/media", label: "Media library", group: "Tools" },
  { href: "/admin/import", label: "Import from a sheet" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const signOut = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  };
  return (
    <div className="flex min-h-svh bg-[#f6f4f0] text-[var(--color-ink)]">
      <aside className="sticky top-0 hidden h-svh w-[232px] shrink-0 flex-col border-r border-dashed bg-white px-5 py-6 tablet:flex" style={{ borderColor: "rgba(79,71,66,0.22)" }}>
        <Link href="/admin" className="mb-8 flex flex-col gap-1 outline-none">
          <span className="font-inter text-[20px] font-semibold tracking-[-0.03em]">arcsphere.</span>
          <span className={cn(LABEL, "text-[var(--color-gold-ink)]")}>Content</span>
        </Link>
        <nav aria-label="Admin" className="flex flex-1 flex-col gap-0.5">
          {ADMIN_NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <div key={item.href} className="flex flex-col">
                {item.group && <span className={cn(LABEL, "mb-2 mt-5 text-[rgba(79,71,66,0.5)]")}>{item.group}</span>}
                <Link href={item.href} className={cn("flex h-9 items-center gap-3 rounded-none px-2 font-inter text-[14px] font-medium outline-none transition-colors focus-visible:text-[var(--color-gold-ink)]", active ? "text-[var(--color-ink)]" : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]")}>
                  <span className="block h-1.5 w-1.5 rounded-full transition-colors" style={{ backgroundColor: active ? "var(--color-gold)" : "transparent" }} />
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="mt-6 flex flex-col gap-2 border-t border-dashed pt-5" style={{ borderColor: "rgba(79,71,66,0.22)" }}>
          <a href="/" target="_blank" rel="noreferrer" className={cn(LABEL, "text-[var(--color-ink-2)] outline-none hover:text-[var(--color-gold-ink)]")}>View site ↗</a>
          <button type="button" onClick={signOut} className={cn(LABEL, "cursor-pointer text-left text-[var(--color-ink-2)] outline-none hover:text-[var(--color-gold-ink)]")}>Sign out</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* phone: a compact top bar with a section picker */}
        <div className="flex items-center justify-between gap-3 border-b border-dashed bg-white px-4 py-3 tablet:hidden" style={{ borderColor: "rgba(79,71,66,0.22)" }}>
          <span className="font-inter text-[18px] font-semibold tracking-[-0.03em]">arcsphere.</span>
          <select aria-label="Admin section" value={ADMIN_NAV.find((n) => (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)))?.href ?? "/admin"} onChange={(e) => router.push(e.target.value)} className="h-9 border border-dashed bg-white px-2 font-inter text-[13px]" style={{ borderColor: "rgba(79,71,66,0.3)" }}>
            {ADMIN_NAV.map((n) => (
              <option key={n.href} value={n.href}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        {children}
      </div>
    </div>
  );
}

export default AdminShell;
