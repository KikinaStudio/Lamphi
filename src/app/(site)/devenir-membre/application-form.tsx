"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FieldError, FormMessage } from "@/components/ui";
import { organizationTypes, sectors } from "@/content/site";
import type { FormState } from "@/lib/types";
import { submitApplication } from "./actions";

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(submitApplication, null);
  const errors = state?.errors;
  const values = state?.values;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Piège à robots, invisible pour les humains */}
      <div className="hidden" aria-hidden>
        <label>
          Site web
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Prénom" name="first_name" autoComplete="given-name" required errors={errors} values={values} />
        <Field label="Nom" name="last_name" autoComplete="family-name" required errors={errors} values={values} />
        <Field label="E-mail professionnel" name="email" type="email" autoComplete="email" required errors={errors} values={values} />
        <Field label="Téléphone" name="phone" type="tel" autoComplete="tel" errors={errors} values={values} />
        <Field label="Organisation" name="company" autoComplete="organization" required errors={errors} values={values} />
        <Field label="Fonction" name="job_title" autoComplete="organization-title" required errors={errors} values={values} hint="Président, Directeur général, membre du Comex…" />
        <div>
          <label htmlFor="organization_type" className="field-label">
            Type d&apos;organisation
          </label>
          <select id="organization_type" name="organization_type" className="field-input" defaultValue={values?.organization_type ?? ""}>
            <option value="">—</option>
            {organizationTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sector" className="field-label">
            Secteur
          </label>
          <select id="sector" name="sector" className="field-input" defaultValue={values?.sector ?? ""}>
            <option value="">—</option>
            {sectors.map((sector) => (
              <option key={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      <Field label="Profil LinkedIn" name="linkedin_url" type="url" placeholder="https://www.linkedin.com/in/…" errors={errors} values={values} />

      <div>
        <label htmlFor="motivation" className="field-label">
          Pourquoi souhaitez-vous rejoindre L&apos;Amphi ?
        </label>
        <textarea id="motivation" name="motivation" rows={5} maxLength={5000} className="field-input" defaultValue={values?.motivation} />
        <FieldError errors={errors} name="motivation" />
      </div>

      <Field label="Recommandé par un membre (facultatif)" name="referral" errors={errors} values={values} />

      <div>
        <label className="flex items-start gap-3 text-sm text-ink-soft">
          <input type="checkbox" name="consent" defaultChecked={values?.consent === "on"} className="mt-1 h-4 w-4 accent-[var(--color-accent)]" />
          <span>
            J&apos;accepte que mes informations soient utilisées pour l&apos;examen de ma candidature (voir la{" "}
            <Link href="/confidentialite" className="underline">
              politique de confidentialité
            </Link>
            ).
          </span>
        </label>
        <FieldError errors={errors} name="consent" />
      </div>

      <FormMessage state={state} />

      <button type="submit" className="btn btn-accent w-full sm:w-auto" disabled={pending}>
        {pending ? "Envoi en cours…" : "Envoyer ma candidature"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  hint,
  errors,
  values,
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(errors?.[name])}
        defaultValue={values?.[name]}
        className="field-input"
        {...rest}
      />
      {hint && !errors?.[name] && <p className="field-hint">{hint}</p>}
      <FieldError errors={errors} name={name} />
    </div>
  );
}
