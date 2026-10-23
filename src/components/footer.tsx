import Link from "next/link";
import { mainNav, site } from "@/content/site";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-5 text-sm leading-relaxed text-paper/70">{site.description}</p>
        </div>
        <div>
          <p className="eyebrow !text-accent-soft">Le club</p>
          <ul className="mt-4 space-y-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-paper/80 hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-accent-soft">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${site.contactEmail}`} className="text-paper/80 hover:text-paper">
                {site.contactEmail}
              </a>
            </li>
            {site.linkedinUrl && (
              <li>
                <a href={site.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-paper/80 hover:text-paper">
                  LinkedIn
                </a>
              </li>
            )}
            <li>
              <Link href="/devenir-membre" className="text-paper/80 hover:text-paper">
                Devenir membre
              </Link>
            </li>
            <li>
              <Link href="/connexion" className="text-paper/80 hover:text-paper">
                Espace membre
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-paper/60 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} — {site.tagline}
          </p>
          <p className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-paper">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-paper">
              Confidentialité
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
