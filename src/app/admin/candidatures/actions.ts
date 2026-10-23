"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { escapeHtml, sendEmail } from "@/lib/email";
import { createMemberAccount } from "@/lib/member-accounts";
import { createClient } from "@/lib/supabase/server";
import type { Application, FormState } from "@/lib/types";

async function loadPendingApplication(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
  const application = data as Application | null;
  if (!application) return { supabase, application: null, error: "Candidature introuvable." };
  if (application.status !== "pending") return { supabase, application: null, error: "Cette candidature a déjà été traitée." };
  return { supabase, application, error: null };
}

export async function approveApplication(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireAdmin("/admin/candidatures");
  const { supabase, application, error } = await loadPendingApplication(id);
  if (!application) return { ok: false, message: error ?? undefined };

  let profileId: string;
  try {
    ({ profileId } = await createMemberAccount(application));
  } catch (accountError) {
    console.error("Création du compte impossible", accountError);
    return {
      ok: false,
      message: `Le compte n'a pas pu être créé : ${accountError instanceof Error ? accountError.message : "erreur inconnue"}.`,
    };
  }

  await supabase
    .from("applications")
    .update({
      status: "approved",
      profile_id: profileId,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: String(formData.get("admin_notes") ?? "").trim() || null,
    })
    .eq("id", id);

  revalidatePath("/admin", "layout");
  return { ok: true, message: `${application.first_name} ${application.last_name} est désormais membre : l'invitation lui a été envoyée par e-mail.` };
}

export async function rejectApplication(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireAdmin("/admin/candidatures");
  const { supabase, application, error } = await loadPendingApplication(id);
  if (!application) return { ok: false, message: error ?? undefined };

  await supabase
    .from("applications")
    .update({
      status: "rejected",
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: String(formData.get("admin_notes") ?? "").trim() || null,
    })
    .eq("id", id);

  let emailed = false;
  if (formData.get("notify") === "on") {
    emailed = await sendEmail({
      to: application.email,
      subject: "Votre demande d'adhésion à L'Amphi",
      html: `<p>Bonjour ${escapeHtml(application.first_name)},</p>
        <p>Nous vous remercions de l'intérêt que vous portez à L'Amphi. Après examen par notre comité de sélection, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre demande d'adhésion.</p>
        <p>Nous vous prions d'agréer nos sincères salutations,<br>L'équipe de L'Amphi</p>`,
    });
  }

  revalidatePath("/admin", "layout");
  return {
    ok: true,
    message: `Candidature refusée.${formData.get("notify") === "on" && !emailed ? " L'e-mail n'a pas pu être envoyé (Resend non configuré)." : ""}`,
  };
}

export async function deleteApplication(id: string) {
  await requireAdmin("/admin/candidatures");
  const supabase = await createClient();
  await supabase.from("applications").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}
