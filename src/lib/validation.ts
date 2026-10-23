import { z } from "zod";
import { MEDIA_BUCKET, supabaseUrl } from "./supabase/config";

// Espaces retirés avant la vérification du format (e-mails copiés-collés).
export const emailField = (message = "Adresse e-mail invalide") =>
  z.string().trim().toLowerCase().max(320).pipe(z.email(message));

// Champ texte facultatif : chaîne vide → null.
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères maximum`)
    .transform((value) => value || null);

export const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .transform((value) => {
    if (!value) return null;
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  })
  .refine((value) => value === null || URL.canParse(value), "Adresse web invalide");

// Images : uniquement celles envoyées dans notre stockage (ou importées de Framer).
export const optionalImageUrl = z
  .string()
  .trim()
  .transform((value) => value || null)
  .refine(
    (value) =>
      value === null ||
      value.startsWith(`${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET}/`) ||
      value.startsWith("https://framerusercontent.com/"),
    "Image non reconnue",
  );

// Champs du profil modifiables par le membre (et par les admins).
export const profileSchema = z.object({
  first_name: z.string().trim().min(1, "Indiquez le prénom").max(100),
  last_name: z.string().trim().min(1, "Indiquez le nom").max(100),
  job_title: optionalText(200),
  company: optionalText(200),
  sector: optionalText(100),
  bio: optionalText(3000),
  phone: optionalText(40),
  linkedin_url: optionalUrl,
  website_url: optionalUrl,
  photo_url: optionalImageUrl,
});

export function checkbox(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export function zodErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
}

export function formValues(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()].filter(([key, value]) => !key.startsWith("$") && typeof value === "string"),
  ) as Record<string, string>;
}
