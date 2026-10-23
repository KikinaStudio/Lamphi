"use client";

import { useActionState } from "react";
import { sectors } from "@/content/site";
import type { FormState, Profile } from "@/lib/types";
import { ImageUpload } from "./image-upload";
import { FieldError, FormMessage } from "./ui";

type ProfileAction = (previous: FormState, formData: FormData) => Promise<FormState>;

// Formulaire de profil, utilisé par le membre (Mon profil) et par les admins (back-office).
export function ProfileForm({ profile, action, submitLabel = "Enregistrer" }: { profile: Profile; action: ProfileAction; submitLabel?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, null);
  const errors = state?.errors;
  const value = (name: keyof Profile) => state?.values?.[name] ?? (profile[name] as string | null) ?? "";

  const text = (name: keyof Profile, label: string, props: { type?: string; required?: boolean; placeholder?: string } = {}) => (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
        {props.required && <span className="text-accent"> *</span>}
      </label>
      <input id={name} name={name} type={props.type ?? "text"} required={props.required} placeholder={props.placeholder} defaultValue={value(name)} className="field-input" />
      <FieldError errors={errors} name={name} />
    </div>
  );

  return (
    <form action={formAction} className="space-y-6">
      <ImageUpload name="photo_url" folder={`avatars/${profile.id}`} defaultUrl={profile.photo_url} label="Photo" round hint="Format carré de préférence, 10 Mo maximum." />

      <div className="grid gap-5 sm:grid-cols-2">
        {text("first_name", "Prénom", { required: true })}
        {text("last_name", "Nom", { required: true })}
        {text("job_title", "Fonction", { placeholder: "Directeur général" })}
        {text("company", "Organisation")}
        <div>
          <label htmlFor="sector" className="field-label">
            Secteur
          </label>
          <select id="sector" name="sector" defaultValue={value("sector")} className="field-input">
            <option value="">—</option>
            {sectors.map((sector) => (
              <option key={sector}>{sector}</option>
            ))}
            {profile.sector && !sectors.includes(profile.sector) && <option>{profile.sector}</option>}
          </select>
        </div>
        {text("phone", "Téléphone", { type: "tel" })}
        {text("linkedin_url", "Profil LinkedIn", { placeholder: "https://www.linkedin.com/in/…" })}
        {text("website_url", "Site web")}
      </div>

      <div>
        <label htmlFor="bio" className="field-label">
          Présentation
        </label>
        <textarea id="bio" name="bio" rows={6} maxLength={3000} defaultValue={value("bio")} className="field-input" />
        <FieldError errors={errors} name="bio" />
      </div>

      <fieldset className="space-y-3 rounded-xl border border-line p-5">
        <legend className="px-1 text-sm font-semibold">Visibilité dans l&apos;annuaire (membres uniquement)</legend>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="show_email" defaultChecked={profile.show_email} className="h-4 w-4 accent-[var(--color-accent)]" />
          Afficher mon e-mail ({profile.email})
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="show_phone" defaultChecked={profile.show_phone} className="h-4 w-4 accent-[var(--color-accent)]" />
          Afficher mon téléphone
        </label>
      </fieldset>

      <FormMessage state={state} />
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
