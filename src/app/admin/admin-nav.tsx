"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/candidatures", label: "Candidatures" },
  { href: "/admin/membres", label: "Membres" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/evenements", label: "Événements" },
  { href: "/admin/partenaires", label: "Partenaires" },
];

export function AdminNav({ pendingApplications }: { pendingApplications: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Back-office" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-0">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
              active ? "bg-paper/10 text-paper" : "text-paper/70 hover:bg-paper/5 hover:text-paper"
            }`}
          >
            {item.label}
            {item.href === "/admin/candidatures" && pendingApplications > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">{pendingApplications}</span>
            )}
          </Link>
        );
      })}
      <Link href="/" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-paper/50 hover:text-paper">
        Voir le site ↗
      </Link>
    </nav>
  );
}
