import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { requireMember } from "@/lib/auth";
import { memberPath } from "@/lib/content";
import { updateProfile } from "./actions";

export const metadata: Metadata = { title: "Mon profil", robots: { index: false } };

export default async function ProfilePage({ searchParams }: PageProps<"/espace-membre/profil">) {
  const { profile } = await requireMember("/espace-membre/profil");
  const welcome = (await searchParams).bienvenue === "1";

  return (
    <section className="container-page max-w-3xl py-12">
      <p className="eyebrow">{welcome ? "Dernière étape" : "Espace membre"}</p>
      <h1 className="mt-3 text-4xl">{welcome ? "Bienvenue ! Complétez votre profil" : "Mon profil"}</h1>
      <p className="mt-3 text-muted">
        Ces informations apparaissent dans l&apos;annuaire, visible uniquement par les membres du club.{" "}
        <Link href={memberPath(profile)} className="text-accent-strong hover:underline">
          Voir ma fiche
        </Link>
      </p>

      <div className="card mt-8 p-6 sm:p-8">
        <ProfileForm profile={profile} action={updateProfile} />
      </div>

      <div className="card mt-6 flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl">Mot de passe</h2>
          <p className="text-sm text-muted">Compte : {profile.email}</p>
        </div>
        <Link href="/nouveau-mot-de-passe" className="btn btn-outline btn-sm">
          Changer mon mot de passe
        </Link>
      </div>
    </section>
  );
}
