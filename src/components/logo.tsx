import Link from "next/link";
import { site } from "@/content/site";

// Logo typographique. Pour utiliser le logo officiel, déposez public/logo.svg
// et remplacez le contenu du lien par <img src="/logo.svg" alt="L'Amphi" className="h-9 w-auto" />.
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="group inline-flex flex-col leading-none" aria-label={`${site.name} — accueil`}>
      <span className={`font-serif text-2xl font-semibold tracking-tight ${inverted ? "text-paper" : "text-ink"}`}>
        L&apos;Amphi
      </span>
      <span className={`mt-1 whitespace-nowrap text-[0.62rem] font-semibold uppercase tracking-[0.2em] ${inverted ? "text-accent-soft" : "text-accent"}`}>
        {site.tagline}
      </span>
    </Link>
  );
}
