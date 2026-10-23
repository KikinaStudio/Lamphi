"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { parisLocalToIso, slugify } from "@/lib/format";
import { sanitizeRichText } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/server";
import type { FormState, RegistrationStatus } from "@/lib/types";
import { checkbox, formValues, optionalImageUrl, optionalText, zodErrors } from "@/lib/validation";

const eventSchema = z.object({
  title: z.string().trim().min(1, "Le titre est obligatoire").max(300),
  slug: z.string().trim().max(200),
  excerpt: optionalText(1000),
  content_html: z.string().max(3_000_000),
  cover_url: optionalImageUrl,
  starts_at: z.string().trim().min(1, "Indiquez la date et l'heure"),
  ends_at: z.string().trim(),
  location: optionalText(200),
  address: optionalText(300),
  capacity: z
    .string()
    .trim()
    .transform((value) => (value ? Number(value) : null))
    .refine((value) => value === null || (Number.isInteger(value) && value > 0), "Nombre de places invalide"),
  status: z.enum(["draft", "published"]),
});

// Pages publiques en cache à régénérer après une modification.
function revalidateEventPages() {
  revalidatePath("/");
  revalidatePath("/le-club");
  revalidatePath("/evenements-de-amphi");
  revalidatePath("/evenements-de-amphi/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/evenements");
}

export async function saveEvent(eventId: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin("/admin/evenements");
  const values = formValues(formData);
  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Merci de vérifier les champs indiqués.", errors: zodErrors(parsed.error), values };
  }

  const { slug: rawSlug, starts_at, ends_at, ...data } = parsed.data;
  const slug = (rawSlug ? rawSlug.normalize("NFC") : slugify(data.title)).trim();
  if (!slug || /[\s/?#]/.test(slug)) {
    return { ok: false, message: "Adresse invalide.", errors: { slug: "Lettres, chiffres et tirets uniquement" }, values };
  }

  const record = {
    ...data,
    slug,
    content_html: sanitizeRichText(data.content_html),
    starts_at: parisLocalToIso(starts_at),
    ends_at: parisLocalToIso(ends_at),
    registration_open: checkbox(formData, "registration_open"),
  };

  const supabase = await createClient();
  const result = eventId
    ? await supabase.from("events").update(record).eq("id", eventId).select("id").single()
    : await supabase.from("events").insert(record).select("id").single();

  if (result.error) {
    if (result.error.code === "23505") {
      return { ok: false, message: "Cette adresse est déjà utilisée.", errors: { slug: "Adresse déjà utilisée" }, values };
    }
    console.error("Événement non enregistré", result.error);
    return { ok: false, message: "Enregistrement impossible.", values };
  }

  revalidateEventPages();
  if (!eventId) redirect(`/admin/evenements/${result.data.id}?enregistre=1`);
  return { ok: true, message: "Événement enregistré." };
}

export async function deleteEvent(eventId: string) {
  await requireAdmin("/admin/evenements");
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId);
  revalidateEventPages();
  redirect("/admin/evenements");
}

export async function setRegistrationStatus(registrationId: string, eventId: string, formData: FormData) {
  await requireAdmin(`/admin/evenements/${eventId}`);
  const status = formData.get("status") as RegistrationStatus;
  if (!["registered", "waitlist", "cancelled"].includes(status)) return;
  const supabase = await createClient();
  await supabase.from("event_registrations").update({ status }).eq("id", registrationId);
  revalidatePath(`/admin/evenements/${eventId}`);
}

export async function addEventPhotos(eventId: string, urls: string[]): Promise<FormState> {
  await requireAdmin(`/admin/evenements/${eventId}`);
  const validUrls = urls.filter((url) => optionalImageUrl.safeParse(url).success && url);
  if (validUrls.length === 0) return { ok: false, message: "Aucune image valide." };

  const supabase = await createClient();
  const { count } = await supabase.from("event_photos").select("id", { count: "exact", head: true }).eq("event_id", eventId);
  const { error } = await supabase
    .from("event_photos")
    .insert(validUrls.map((url, index) => ({ event_id: eventId, url, position: (count ?? 0) + index })));
  if (error) return { ok: false, message: "Les photos n'ont pas pu être ajoutées." };

  revalidatePath(`/admin/evenements/${eventId}`);
  return { ok: true, message: `${validUrls.length} photo${validUrls.length > 1 ? "s" : ""} ajoutée${validUrls.length > 1 ? "s" : ""}.` };
}

export async function deleteEventPhoto(photoId: string, eventId: string) {
  await requireAdmin(`/admin/evenements/${eventId}`);
  const supabase = await createClient();
  await supabase.from("event_photos").delete().eq("id", photoId);
  revalidatePath(`/admin/evenements/${eventId}`);
}
