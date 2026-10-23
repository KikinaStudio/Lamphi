"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";
import { formValues, optionalImageUrl, optionalUrl, zodErrors } from "@/lib/validation";

const partnerSchema = z.object({
  name: z.string().trim().min(1, "Indiquez le nom").max(200),
  website_url: optionalUrl,
  logo_url: optionalImageUrl,
  position: z
    .string()
    .trim()
    .transform((value) => Number(value || 0))
    .refine((value) => Number.isInteger(value), "Nombre entier attendu"),
});

export async function savePartner(partnerId: string | null, _previous: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin("/admin/partenaires");
  const values = formValues(formData);
  const parsed = partnerSchema.safeParse(values);
  if (!parsed.success) return { ok: false, message: "Merci de vérifier les champs.", errors: zodErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = partnerId
    ? await supabase.from("partners").update(parsed.data).eq("id", partnerId)
    : await supabase.from("partners").insert(parsed.data);
  if (error) return { ok: false, message: "Enregistrement impossible.", values };

  revalidatePath("/");
  revalidatePath("/admin/partenaires");
  return { ok: true, message: partnerId ? "Partenaire mis à jour." : "Partenaire ajouté." };
}

export async function deletePartner(partnerId: string) {
  await requireAdmin("/admin/partenaires");
  const supabase = await createClient();
  await supabase.from("partners").delete().eq("id", partnerId);
  revalidatePath("/");
  revalidatePath("/admin/partenaires");
}
