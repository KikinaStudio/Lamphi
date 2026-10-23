"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileMenu({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Referme le menu à chaque changement de page.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Navigation mobile"
          className="fixed inset-x-0 top-18 bottom-0 z-50 overflow-y-auto bg-paper px-4 pb-10 pt-4"
        >
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-4 font-serif text-xl">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/connexion" className="block py-4 font-serif text-xl">
                Connexion / Espace membre
              </Link>
            </li>
          </ul>
          <Link href="/devenir-membre" className="btn btn-accent mt-6 w-full">
            Devenir membre
          </Link>
        </nav>
      )}
    </div>
  );
}
