import Link from "next/link";
import { Suspense } from "react";
import { mainNav } from "@/content/site";
import { getViewer, isActiveMember } from "@/lib/auth";
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
          <Suspense fallback={<AccountLinks signedIn={false} />}>
            <AccountArea />
          </Suspense>
          <MobileMenu items={mainNav} />
        </div>
      </div>
    </header>
  );
}

async function AccountArea() {
  const viewer = await getViewer();
  return <AccountLinks signedIn={isActiveMember(viewer)} />;
}

function AccountLinks({ signedIn }: { signedIn: boolean }) {
  if (signedIn) {
    return (
      <Link href="/espace-membre" className="btn btn-primary btn-sm whitespace-nowrap">
        Espace membre
      </Link>
    );
  }
  return (
    <>
      <Link href="/connexion" className="hidden text-sm font-medium text-ink-soft hover:text-accent-strong sm:inline">
        Connexion
      </Link>
      {/* Sur petit écran, l'appel à l'action est dans le menu mobile. */}
      <Link href="/devenir-membre" className="btn btn-accent btn-sm hidden whitespace-nowrap sm:inline-flex">
        Devenir membre
      </Link>
    </>
  );
}
