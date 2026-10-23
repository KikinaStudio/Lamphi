"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createMemberAccount, sendPasswordLink } from "@/lib/member-accounts";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { FormState, MemberRole, MemberStatus } from "@/lib/types";
import { checkbox, emailField, formValues, optionalText, optionalUrl, profileSchema, zodErrors } from "@/lib/validation";

const newMemberSchema = z.object({
  email: emailField(),
  first_name: z.string().trim().min(1, "Indiquez le prénom").max(100),
  last_name: z.string().trim().min(1, "Indiquez le nom").max(100),
  job_title: optionalText(200),
  company: optionalText(200),
  sector: optionalText(100),
  phone: optionalText(40),
  linkedin_url: optionalUrl,
});

export async function inviteMember(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin("/admin/membres");
  const values = formValues(formData);
  const parsed = newMemberSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Merci de vérifier les champs indiqués.", errors: zodErrors(parsed.error), values };

  let profileId: string;
  try {
    ({ profileId } = await createMemberAccount(parsed.data));
  } catch (error) {
    return { ok: false, message: `Invitation impossible : ${error instanceof Error ? error.message : "erreur inconnue"}.`, values };
  }

  revalidatePath("/admin", "layout");
  redirect(`/admin/membres/${profileId}?invite=1`);
}

export async function updateMemberProfile(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin(`/admin/membres/${id}`);
  const values = formValues(formData);
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Merci de vérifier les champs indiqués.", errors: zodErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, show_email: checkbox(formData, "show_email"), show_phone: checkbox(formData, "show_phone") })
    .eq("id", id);
  if (error) return { ok: false, message: "Enregistrement impossible.", values };

  revalidatePath("/admin/membres");
  revalidatePath("/annuaire-des-membres", "layout");
  return { ok: true, message: "Profil mis à jour." };
}

export async function setMemberAccess(id: string, formData: FormData) {
  const { profile } = await requireAdmin(`/admin/membres/${id}`);
  const role = formData.get("role") as MemberRole | null;
  const status = formData.get("status") as MemberStatus | null;

  // Un admin ne peut pas se retirer ses propres droits (évite de se bloquer dehors).
  if (id === profile.id && (role === "member" || status === "suspended")) return;

  const update: { role?: MemberRole; status?: MemberStatus } = {};
  if (role === "member" || role === "admin") update.role = role;
  if (status === "active" || status === "suspended") update.status = status;
  if (Object.keys(update).length === 0) return;

  await createAdminClient().from("profiles").update(update).eq("id", id);
  revalidatePath("/admin/membres");
  revalidatePath(`/admin/membres/${id}`);
}

export async function resendAccessEmail(email: string, id: string): Promise<FormState> {
  await requireAdmin(`/admin/membres/${id}`);
  try {
    await sendPasswordLink(email);
  } catch (error) {
    return { ok: false, message: `Envoi impossible : ${error instanceof Error ? error.message : "erreur inconnue"}.` };
  }
  return { ok: true, message: `Un lien pour choisir son mot de passe a été envoyé à ${email}.` };
}

export async function deleteMember(id: string) {
  const { profile } = await requireAdmin(`/admin/membres/${id}`);
  if (id === profile.id) return;
  // Supprime le compte de connexion ; le profil et les inscriptions suivent (cascade).
  await createAdminClient().auth.admin.deleteUser(id);
  revalidatePath("/admin", "layout");
  redirect("/admin/membres");
}
