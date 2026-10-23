import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, LockIcon } from "./icons";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line">
      <div className="container-page py-14 sm:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">{title}</h1>
        {intro && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{intro}</div>}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "Tout voir",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-accent-strong hover:underline">
          {linkLabel} <ArrowIcon />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="card px-6 py-10 text-center text-muted">{children}</p>;
}

export function MembersOnly({ next, title = "Contenu réservé aux membres" }: { next: string; title?: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        <LockIcon size={20} />
      </span>
      <h2 className="mt-4 text-2xl">{title}</h2>
      <p className="mt-2 max-w-md text-muted">
        Ce contenu est accessible aux membres de L&apos;Amphi. Connectez-vous ou découvrez comment rejoindre le club.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href={`/connexion?next=${encodeURIComponent(next)}`} className="btn btn-primary">
          Se connecter
        </Link>
        <Link href="/devenir-membre" className="btn btn-outline">
          Devenir membre
        </Link>
      </div>
    </div>
  );
}

export function Avatar({
  name,
  initials,
  url,
  size = 56,
}: {
  name: string;
  initials: string;
  url?: string | null;
  size?: number;
}) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-serif font-semibold text-accent-strong"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

export function FormMessage({ state }: { state: { ok?: boolean; message?: string } | null }) {
  if (!state?.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-lg px-4 py-3 text-sm ${state.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
    >
      {state.message}
    </p>
  );
}

export function FieldError({ errors, name }: { errors?: Record<string, string>; name: string }) {
  const message = errors?.[name];
  return message ? <p className="field-error">{message}</p> : null;
}
