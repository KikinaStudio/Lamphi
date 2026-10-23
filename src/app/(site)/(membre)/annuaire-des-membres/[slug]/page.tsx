import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LinkIcon, MailIcon, PhoneIcon } from "@/components/icons";
import { Avatar } from "@/components/ui";
import { requireMember } from "@/lib/auth";
import { decodeSlug } from "@/lib/content";
import { getDirectoryMember } from "@/lib/data/members";
import { fullName, initials } from "@/lib/format";

export const metadata: Metadata = { title: "Page membre", robots: { index: false } };

export default async function MemberPage({ params }: PageProps<"/annuaire-des-membres/[slug]">) {
  const slug = decodeSlug((await params).slug);
  const viewer = await requireMember(`/annuaire-des-membres/${slug}`);
  const member = await getDirectoryMember(slug);
  if (!member) notFound();

  const isMe = member.id === viewer.userId;

  return (
    <section className="container-page max-w-4xl py-12">
      <Link href="/annuaire-des-membres" className="text-sm font-medium text-accent-strong hover:underline">
        ← Annuaire des membres
      </Link>

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar name={fullName(member)} initials={initials(member)} url={member.photo_url} size={120} />
        <div>
          <h1 className="text-4xl">{fullName(member)}</h1>
          {member.job_title && <p className="mt-2 text-lg text-ink-soft">{member.job_title}</p>}
          {member.company && <p className="text-lg font-semibold text-accent-strong">{member.company}</p>}
          {member.sector && <p className="badge mt-3 bg-accent-soft text-accent-strong">{member.sector}</p>}
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-[2fr_1fr]">
        <div>
          {member.bio ? (
            <p className="whitespace-pre-line text-lg leading-relaxed text-ink-soft">{member.bio}</p>
          ) : (
            <p className="text-muted">Ce membre n&apos;a pas encore rédigé de présentation.</p>
          )}
        </div>
        <aside className="card h-fit space-y-3 p-6 text-sm">
          <p className="eyebrow">Contact</p>
          {member.email && (
            <a href={`mailto:${member.email}`} className="flex items-center gap-2 break-all hover:text-accent-strong">
              <MailIcon /> {member.email}
            </a>
          )}
          {member.phone && (
            <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-accent-strong">
              <PhoneIcon /> {member.phone}
            </a>
          )}
          {member.linkedin_url && (
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent-strong">
              <LinkIcon /> LinkedIn
            </a>
          )}
          {member.website_url && (
            <a href={member.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 break-all hover:text-accent-strong">
              <LinkIcon /> {member.website_url.replace(/^https?:\/\//, "")}
            </a>
          )}
          {!member.email && !member.phone && !member.linkedin_url && !member.website_url && (
            <p className="text-muted">Coordonnées non communiquées.</p>
          )}
        </aside>
      </div>

      {isMe && (
        <Link href="/espace-membre/profil" className="btn btn-outline mt-10">
          Modifier mon profil
        </Link>
      )}
    </section>
  );
}
