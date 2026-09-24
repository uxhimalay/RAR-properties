"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { MediaItem, SiteContent } from "@/lib/cms/schema";
import { Button, LABEL, Toast } from "@/components/admin/ui";
import { Overview } from "@/components/admin/editors/Overview";
import { HeroEditor } from "@/components/admin/editors/HeroEditor";
import { WorkEditor } from "@/components/admin/editors/WorkEditor";
import { CategoriesEditor } from "@/components/admin/editors/CategoriesEditor";
import { DealsEditor } from "@/components/admin/editors/DealsEditor";
import { ServicesEditor } from "@/components/admin/editors/ServicesEditor";
import { PartnersEditor } from "@/components/admin/editors/PartnersEditor";
import { StatementEditor } from "@/components/admin/editors/StatementEditor";
import { VisitEditor } from "@/components/admin/editors/VisitEditor";
import { FooterEditor } from "@/components/admin/editors/FooterEditor";
import { PropertiesEditor } from "@/components/admin/editors/PropertiesEditor";
import { MediaLibrary } from "@/components/admin/editors/MediaLibrary";
import { ImportPage } from "@/components/admin/editors/ImportPage";

/* ------------------------------------------------------------------------------------------------
 * The admin's state lives in the LAYOUT (AdminProvider + AdminHeader), which Next keeps mounted
 * while you move between screens, so the document and any unsaved edits survive navigation. Each
 * screen (AdminScreen, rendered by the page) reads that state from context and edits it.
 *
 * The document is loaded once, edits stay in memory, and Save (or Cmd/Ctrl+S) writes the whole
 * document. Uploads and media changes are saved by the server immediately.
 * ---------------------------------------------------------------------------------------------- */

export interface EditorProps {
  content: SiteContent;
  /** Apply a change to the document (kept in memory until Save). */
  update: (fn: (c: SiteContent) => SiteContent) => void;
  /** Replace the media list after the server changed it (upload, archive, delete). */
  setMedia: (media: MediaItem[]) => void;
  /** Save now (used by the import, which should never leave work unsaved). */
  save: (next?: SiteContent) => Promise<boolean>;
  notify: (message: string, tone?: "ok" | "error") => void;
  path: string[];
}

interface AdminState {
  content: SiteContent | null;
  loadError: string | null;
  dirty: boolean;
  saving: boolean;
  update: EditorProps["update"];
  setMedia: EditorProps["setMedia"];
  save: EditorProps["save"];
  notify: EditorProps["notify"];
  discard: () => void;
}

const AdminContext = createContext<AdminState | null>(null);
const useAdmin = () => {
  const s = useContext(AdminContext);
  if (!s) throw new Error("useAdmin outside AdminProvider");
  return s;
};

const SCREENS: Record<string, { title: string; hint: string; render: (p: EditorProps) => ReactNode }> = {
  "": { title: "Overview", hint: "What the site is showing right now.", render: (p) => <Overview {...p} /> },
  hero: { title: "Hero", hint: "The first screen: headline, labels, intro, links and the three photos.", render: (p) => <HeroEditor {...p} /> },
  work: { title: "Work band", hint: "The black band: header, the counting figure beside it, the 3D image marquee and the stats ribbon.", render: (p) => <WorkEditor {...p} /> },
  categories: { title: "Categories", hint: "The tabs and the property cards. Cards come from your property listings.", render: (p) => <CategoriesEditor {...p} /> },
  deals: { title: "Hot deals", hint: "Which property is on offer, the price card, the room photos and the booking calendar.", render: (p) => <DealsEditor {...p} /> },
  services: { title: "Services", hint: "The eight service cards and what each pop-up says.", render: (p) => <ServicesEditor {...p} /> },
  partners: { title: "Partners", hint: "The ribbon of developers you work with.", render: (p) => <PartnersEditor {...p} /> },
  statement: { title: "Statement", hint: "The full screen after the ribbon: one word behind a portrait, a heading over it, and a paragraph with two links.", render: (p) => <StatementEditor {...p} /> },
  visit: { title: "Book a visit", hint: "The scattering photos and the invitation beneath them.", render: (p) => <VisitEditor {...p} /> },
  footer: { title: "Footer & contact", hint: "How people reach you, and the footer's lines.", render: (p) => <FooterEditor {...p} /> },
  properties: { title: "Properties", hint: "Every listing: what a card shows and what its page says.", render: (p) => <PropertiesEditor {...p} /> },
  media: { title: "Media library", hint: "Every photo on the site. Upload, retitle, archive or delete.", render: (p) => <MediaLibrary {...p} /> },
  import: { title: "Import from a sheet", hint: "Paste or upload a spreadsheet of properties. Map the columns yourself or let an AI model do it.", render: (p) => <ImportPage {...p} /> },
};

const pathSegments = (pathname: string) => pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

export function AdminProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [savedJson, setSavedJson] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "error" } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const notify = useCallback((message: string, tone: "ok" | "error" = "ok") => setToast({ message, tone }), []);

  useEffect(() => {
    fetch("/api/cms/content", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        if (!r.ok) throw new Error("Could not load the content");
        return r.json();
      })
      .then((doc: SiteContent | null) => {
        if (!doc) return;
        setContent(doc);
        setSavedJson(JSON.stringify(doc));
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Could not load"));
  }, [router]);

  const update = useCallback((fn: (c: SiteContent) => SiteContent) => setContent((c) => (c ? fn(c) : c)), []);
  const setMedia = useCallback((media: MediaItem[]) => {
    setContent((c) => (c ? { ...c, media } : c));
    setSavedJson((json) => {
      try {
        return JSON.stringify({ ...(JSON.parse(json) as SiteContent), media });
      } catch {
        return json;
      }
    });
  }, []);

  const save = useCallback(
    async (next?: SiteContent) => {
      const doc = next ?? content;
      if (!doc) return false;
      setSaving(true);
      try {
        const res = await fetch("/api/cms/content", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(doc) });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error ?? "Could not save");
        setContent(body);
        setSavedJson(JSON.stringify(body));
        notify("Saved. The site shows it on the next load.");
        return true;
      } catch (e) {
        notify(e instanceof Error ? e.message : "Could not save", "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [notify, content],
  );

  const dirty = !!content && JSON.stringify(content) !== savedJson;
  const discard = useCallback(() => {
    try {
      setContent(JSON.parse(savedJson));
    } catch {
      /* ignore */
    }
  }, [savedJson]);

  // Cmd/Ctrl+S saves; closing the tab with unsaved changes asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) void save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty, save]);

  return (
    <AdminContext.Provider value={{ content, loadError, dirty, saving, update, setMedia, save, notify, discard }}>
      {children}
      <Toast message={toast?.message ?? null} tone={toast?.tone} onDone={() => setToast(null)} />
    </AdminContext.Provider>
  );
}

/** The sticky bar: screen title, unsaved state, Discard and Save. Lives in the layout. */
export function AdminHeader() {
  const { content, dirty, saving, save, discard } = useAdmin();
  const pathname = usePathname();
  const screen = SCREENS[pathSegments(pathname)[0] ?? ""] ?? SCREENS[""];
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-dashed bg-[#f6f4f0]/90 px-5 py-4 backdrop-blur tablet:px-8" style={{ borderColor: "rgba(79,71,66,0.22)" }}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="truncate font-display text-[22px] font-normal leading-[1.1] tracking-[-0.02em]">{screen.title}</h1>
        <p className="hidden truncate font-inter text-[13px] font-medium text-[var(--color-ink-2)] tablet:block">{screen.hint}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={cn(LABEL, "hidden tablet:block", dirty ? "text-[var(--color-gold-ink)]" : "text-[rgba(79,71,66,0.45)]")} aria-live="polite">
          {dirty ? "Unsaved changes" : content ? "All saved" : "Loading"}
        </span>
        {dirty && <Button onClick={discard}>Discard</Button>}
        <Button variant="primary" onClick={() => void save()} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </header>
  );
}

/** The page body: the editor for the current path, fed from the layout's state. */
export function AdminScreen() {
  const { content, loadError, update, setMedia, save, notify } = useAdmin();
  const pathname = usePathname();
  const path = pathSegments(pathname);
  const screen = SCREENS[path[0] ?? ""] ?? SCREENS[""];
  return (
    <main className="flex-1 px-5 py-6 tablet:px-8 tablet:py-8">
      {loadError && <p role="alert" className="font-inter text-[14px] font-medium text-[#a2432d]">{loadError}</p>}
      {!content && !loadError && <p className={cn(LABEL, "text-[rgba(79,71,66,0.5)]")}>Loading the content…</p>}
      {content && <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">{screen.render({ content, update, setMedia, save, notify, path })}</div>}
    </main>
  );
}
