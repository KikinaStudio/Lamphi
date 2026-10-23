"use client";

import { useActionState } from "react";
import { FieldError, FormMessage } from "@/components/ui";
import { sectors } from "@/content/site";
import type { FormState } from "@/lib/types";
import { inviteMember } from "../actions";

const FIELDS = [
  { name: "first_name", label: "Prénom", required: true },
  { name: "last_name", label: "Nom", required: true },
  { name: "email", label: "E-mail", type: "email", required: true },
  { name: "phone", label: "Téléphone", type: "tel" },
  { name: "company", label: "Organisation" },
  { name: "job_title", label: "Fonction" },
  { name: "linkedin_url", label: "Profil LinkedIn" },
];

export function InviteForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(inviteMember, null);
  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="field-label">
              {field.label}
              {field.required && <span className="text-accent"> *</span>}
            </label>
            <input id={field.name} name={field.name} type={field.type ?? "text"} required={field.required} defaultValue={state?.values?.[field.name]} className="field-input" />
            <FieldError errors={state?.errors} name={field.name} />
          </div>
        ))}
        <div>
          <label htmlFor="sector" className="field-label">
            Secteur
          </label>
          <select id="sector" name="sector" defaultValue={state?.values?.sector ?? ""} className="field-input">
            <option value="">—</option>
            {sectors.map((sector) => (
              <option key={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>
      <FormMessage state={state} />
      <button type="submit" className="btn btn-accent" disabled={pending}>
        {pending ? "Invitation…" : "Créer le compte et envoyer l'invitation"}
      </button>
    </form>
  );
}
