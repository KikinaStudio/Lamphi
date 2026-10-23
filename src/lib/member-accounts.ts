import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "./format";
import { getSiteUrl } from "./site-url";
import { createAdminClient } from "./supabase/admin";

export type NewMember = {
  email: string;
  first_name: string;
  last_name: string;
  job_title?: string | null;
  company?: string | null;
  sector?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
};

// Crée (ou réactive) le compte d'un membre et lui envoie l'e-mail d'invitation
// pour choisir son mot de passe. Renvoie l'identifiant du profil.
export async function createMemberAccount(member: NewMember): Promise<{ profileId: string; emailSent: "invite" | "recovery" }> {
  const admin = createAdminClient();
  const email = member.email.trim().toLowerCase();
  const passwordPage = `${getSiteUrl()}/nouveau-mot-de-passe`;

  let userId: string;
  let emailSent: "invite" | "recovery" = "invite";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${passwordPage}?bienvenue=1`,
    data: { first_name: member.first_name, last_name: member.last_name },
  });

  if (data?.user) {
    userId = data.user.id;
  } else {
    // Le compte existe déjà (ancien membre, invitation renvoyée…) : on le retrouve
    // et on lui envoie un lien pour (re)définir son mot de passe.
    const { data: existingId } = await admin.rpc("find_auth_user_id", { p_email: email });
    if (!existingId) throw new Error(error?.message ?? "Invitation impossible");
    userId = existingId as string;
    emailSent = "recovery";
    const { error: resetError } = await admin.auth.resetPasswordForEmail(email, { redirectTo: passwordPage });
    if (resetError) throw new Error(resetError.message);
  }

  const { data: existingProfile } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (existingProfile) {
    const { error: updateError } = await admin.from("profiles").update({ status: "active" }).eq("id", userId);
    if (updateError) throw new Error(updateError.message);
  } else {
    const { error: insertError } = await admin.from("profiles").insert({
      id: userId,
      email,
      slug: await uniqueProfileSlug(admin, `${member.first_name} ${member.last_name}`),
      first_name: member.first_name,
      last_name: member.last_name,
      job_title: member.job_title ?? null,
      company: member.company ?? null,
      sector: member.sector ?? null,
      phone: member.phone ?? null,
      linkedin_url: member.linkedin_url ?? null,
    });
    if (insertError) throw new Error(insertError.message);
  }

  return { profileId: userId, emailSent };
}

// Renvoie un lien pour choisir un mot de passe (invitation non reçue, mot de passe perdu…).
export async function sendPasswordLink(email: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo: `${getSiteUrl()}/nouveau-mot-de-passe` });
  if (error) throw new Error(error.message);
}

export async function uniqueProfileSlug(admin: SupabaseClient, name: string) {
  const base = slugify(name) || "membre";
  const { data } = await admin.from("profiles").select("slug").like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((row: { slug: string }) => row.slug));
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
