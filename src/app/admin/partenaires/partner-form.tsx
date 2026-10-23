"use client";

import { useActionState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { FieldError, FormMessage } from "@/components/ui";
import type { FormState, Partner } from "@/lib/types";
import { savePartner } from "./actions";

export function PartnerForm({ partner, nextPosition = 0 }: { partner?: Partner; nextPosition?: number }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(savePartner.bind(null, partner?.id ?? null), null);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
      <ImageUpload name="logo_url" folder="partners" defaultUrl={partner?.logo_url} label="Logo" />
      <div className="grid gap-3 sm:grid-cols-[2fr_2fr_6rem_auto] sm:items-end">
        <div>
          <label className="field-label" htmlFor={`name-${partner?.id ?? "new"}`}>
            Nom
          </label>
          <input id={`name-${partner?.id ?? "new"}`} name="name" required defaultValue={state?.values?.name ?? partner?.name} className="field-input" />
          <FieldError errors={state?.errors} name="name" />
        </div>
        <div>
          <label className="field-label" htmlFor={`website-${partner?.id ?? "new"}`}>
            Site web
          </label>
          <input id={`website-${partner?.id ?? "new"}`} name="website_url" defaultValue={state?.values?.website_url ?? partner?.website_url ?? ""} className="field-input" />
          <FieldError errors={state?.errors} name="website_url" />
        </div>
        <div>
          <label className="field-label" htmlFor={`position-${partner?.id ?? "new"}`}>
            Ordre
          </label>
          <input id={`position-${partner?.id ?? "new"}`} name="position" type="number" defaultValue={state?.values?.position ?? partner?.position ?? nextPosition} className="field-input" />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
          {pending ? "…" : partner ? "Enregistrer" : "Ajouter"}
        </button>
        <div className="sm:col-span-4">
          <FormMessage state={state} />
        </div>
      </div>
    </form>
  );
}
