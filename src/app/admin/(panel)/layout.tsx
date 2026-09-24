import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/cms/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminHeader, AdminProvider } from "@/components/admin/AdminApp";

/**
 * Every admin page: signed in or sent to the gate. The document and the Save bar live here, in the
 * layout, so moving between screens never loses unsaved edits.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <AdminShell>
      <AdminProvider>
        <AdminHeader />
        {children}
      </AdminProvider>
    </AdminShell>
  );
}
