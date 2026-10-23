import Link from "next/link";
import { mainNav } from "@/content/site";
import { AccountLinks } from "./account-links";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur">
      <div className="container-page flex h-18 items-center justify-between gap-6 py-3">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden items-center gap-6 lg:flex">
          {mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-ink-soft hover:text-accent-strong">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <AccountLinks />
          <MobileMenu items={mainNav} />
        </div>
      </div>
    </header>
  );
}
