"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { adminNotificationEmails, escapeHtml, sendEmail } from "@/lib/email";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import type { FormState } from "@/lib/types";
import { emailField, formValues, optionalText, optionalUrl, zodErrors } from "@/lib/validation";

const applicationSchema = z.object({
  first_name: z.string().trim().min(1, "Indiquez votre prénom").max(100),
  last_name: z.string().trim().min(1, "Indiquez votre nom").max(100),
  email: emailField(),
  phone: optionalText(40),
  company: z.string().trim().min(1, "Indiquez votre organisation").max(200),
  job_title: z.string().trim().min(1, "Indiquez votre fonction").max(200),
  organization_type: optionalText(100),
  sector: optionalText(100),
  linkedin_url: optionalUrl,
  motivation: optionalText(5000),
  referral: optionalText(500),
});

const consentSchema = z.literal("on", { error: "Votre accord est nécessaire pour traiter la candidature" });

export async function submitApplication(_previous: FormState, formData: FormData): Promise<FormState> {
  // Champ invisible : seuls les robots le remplissent.
  if (formData.get("website")) redirect("/devenir-membre/merci");

  const values = formValues(formData);
  const parsed = applicationSchema.safeParse(values);
  const consent = consentSchema.safeParse(values.consent);
  if (!parsed.success || !consent.success) {
    const errors = {
      ...(parsed.success ? {} : zodErrors(parsed.error)),
      ...(consent.success ? {} : { consent: consent.error.issues[0].message }),
    };
    return { ok: false, message: "Merci de vérifier les champs indiqués.", errors, values };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, message: "Mode démonstration : la candidature n'a pas été enregistrée.", values };
  }

  const application = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("applications").insert(application);
  if (error) {
    console.error("Candidature non enregistrée", error);
    return { ok: false, message: "Une erreur est survenue. Réessayez ou écrivez-nous directement.", values };
  }

  const name = escapeHtml(`${application.first_name} ${application.last_name}`);
  const admins = adminNotificationEmails();
  await Promise.all([
    admins.length > 0 &&
      sendEmail({
        to: admins,
        subject: `Nouvelle candidature : ${application.first_name} ${application.last_name}`,
        html: `<p><strong>${name}</strong> — ${escapeHtml(application.job_title)}, ${escapeHtml(application.company)}</p>
          <p><a href="${getSiteUrl()}/admin/candidatures">Examiner la candidature</a></p>`,
      }),
    sendEmail({
      to: application.email,
      subject: "Votre demande d'adhésion à L'Amphi",
      html: `<p>Bonjour ${escapeHtml(application.first_name)},</p>
        <p>Nous avons bien reçu votre demande d'adhésion à L'Amphi. Elle sera examinée avec attention par notre comité de sélection, qui reviendra vers vous rapidement.</p>
        <p>L'équipe de L'Amphi</p>`,
    }),
  ]);

  redirect("/devenir-membre/merci");
}
