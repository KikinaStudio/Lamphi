"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { POST_CATEGORIES } from "@/lib/content";
import { parisLocalToIso, slugify } from "@/lib/format";
import { sanitizeRichText } from "@/lib/sanitize";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { checkbox, formValues, optionalImageUrl, optionalText, optionalUrl, zodErrors } from "@/lib/validation";

const postSchema = z.object({
  title: z.string().trim().min(1, "Le titre est obligatoire").max(300),
  slug: z.string().trim().max(200),
  category: z.enum(["decryptage", "tribune", "interview", "actu", "agenda"], { error: "Choisissez une rubrique" }),
  excerpt: optionalText(1000),
  content_html: z.string().max(3_000_000, "Le texte est trop long"),
  cover_url: optionalImageUrl,
  video_url: optionalUrl,
  author_name: optionalText(200),
  author_title: optionalText(200),
  event_date: z
    .string()
    .trim()
    .transform((value) => value || null)
    .refine((value) => value === null || /^\d{4}-\d{2}-\d{2}$/.test(value), "Date invalide"),
  location: optionalText(200),
  external_url: optionalUrl,
  status: z.enum(["draft", "published"]),
  published_at: z.string().trim(),
});

// Les pages publiques sont en cache : on les régénère toutes (un article peut changer de rubrique
// ou d'adresse, et apparaît sur l'accueil). Le coût est négligeable, la régénération se fait à la visite.
function revalidatePostPages() {
  revalidatePath("/");
  for (const { basePath } of Object.values(POST_CATEGORIES)) {
    revalidatePath(basePath);
    revalidatePath(`${basePath}/[slug]`, "page");
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/articles");
}

export async function savePost(postId: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  const { profile } = await requireAdmin("/admin/articles");
  const values = formValues(formData);
  const parsed = postSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, message: "Merci de vérifier les champs indiqués.", errors: zodErrors(parsed.error), values };
  }

  const { published_at, slug: rawSlug, ...data } = parsed.data;
  const slug = (rawSlug ? rawSlug.normalize("NFC") : slugify(data.title)).trim();
  if (!slug || /[\s/?#]/.test(slug)) {
    return { ok: false, message: "Adresse invalide.", errors: { slug: "Lettres, chiffres et tirets uniquement" }, values };
  }
  if (data.category === "agenda" && !data.event_date) {
    return { ok: false, message: "Indiquez la date de l'événement.", errors: { event_date: "Obligatoire pour l'agenda" }, values };
  }

  const record = {
    ...data,
    slug,
    content_html: sanitizeRichText(data.content_html),
    visibility: checkbox(formData, "members_only") ? "members" : "public",
    // Une date de publication dans le futur programme la mise en ligne.
    published_at: parisLocalToIso(published_at) ?? (data.status === "published" ? new Date().toISOString() : null),
  };

  const supabase = await createClient();
  const result = postId
    ? await supabase.from("posts").update(record).eq("id", postId).select("id").single()
    : await supabase.from("posts").insert({ ...record, created_by: profile.id }).select("id").single();

  if (result.error) {
    if (result.error.code === "23505") {
      return { ok: false, message: "Cette adresse est déjà utilisée par un autre contenu.", errors: { slug: "Adresse déjà utilisée" }, values };
    }
    console.error("Article non enregistré", result.error);
    return { ok: false, message: "Enregistrement impossible.", values };
  }

  revalidatePostPages();
  if (!postId) redirect(`/admin/articles/${result.data.id}?enregistre=1`);
  return { ok: true, message: data.status === "published" ? "Article enregistré et publié." : "Brouillon enregistré." };
}

export async function deletePost(postId: string) {
  await requireAdmin("/admin/articles");
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePostPages();
  redirect("/admin/articles");
}
