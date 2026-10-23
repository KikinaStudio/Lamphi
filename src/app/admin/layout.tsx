import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Back-office", template: "%s — Back-office" }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile } = await requireAdmin();
  const supabase = await createClient();
  const { count: pending } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-line bg-ink text-paper lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Logo inverted />
          <p className="hidden pt-2 text-xs text-paper/50 lg:block">Back-office</p>
        </div>
        <AdminNav pendingApplications={pending ?? 0} />
        <div className="hidden px-5 py-6 text-xs text-paper/60 lg:absolute lg:bottom-0 lg:block">
          <p>
            Connecté : {profile.first_name} {profile.last_name}
          </p>
          <Link href="/espace-membre" className="mt-2 inline-block text-paper/80 hover:text-paper">
            ← Espace membre
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
