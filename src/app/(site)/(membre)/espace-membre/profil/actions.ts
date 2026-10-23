"use server";

import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import { memberPath } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { checkbox, formValues, profileSchema, zodErrors } from "@/lib/validation";

export async function updateProfile(_previous: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireMember("/espace-membre/profil");
  const values = formValues(formData);
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Merci de vérifier les champs indiqués.", errors: zodErrors(parsed.error), values };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      ...parsed.data,
      show_email: checkbox(formData, "show_email"),
      show_phone: checkbox(formData, "show_phone"),
    })
    .eq("id", profile.id);

  if (error) {
    console.error("Profil non enregistré", error);
    return { ok: false, message: "Impossible d'enregistrer le profil pour le moment.", values };
  }

  revalidatePath("/annuaire-des-membres");
  revalidatePath(memberPath(profile));
  revalidatePath("/espace-membre");
  return { ok: true, message: "Votre profil a été mis à jour." };
}
