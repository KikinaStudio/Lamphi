"use client";

import { useActionState, useState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/image-upload";
import { FieldError, FormMessage } from "@/components/ui";
import { isoToParisLocal, slugify } from "@/lib/format";
import type { ClubEvent, FormState } from "@/lib/types";
import { saveEvent } from "./actions";

export function EventForm({ event }: { event?: ClubEvent }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveEvent.bind(null, event?.id ?? null), null);
  const errors = state?.errors;
  const values = state?.values;
  const value = (name: keyof ClubEvent) => values?.[name] ?? (event?.[name] as string | null | undefined)?.toString() ?? "";

  const [title, setTitle] = useState(values?.title ?? event?.title ?? "");
  const [slug, setSlug] = useState(values?.slug ?? event?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(event));

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-6">
        <div>
          <label htmlFor="title" className="field-label">
            Titre <span className="text-accent">*</span>
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(changeEvent) => {
              setTitle(changeEvent.target.value);
              if (!slugEdited) setSlug(slugify(changeEvent.target.value));
            }}
            className="field-input font-serif text-xl"
          />
          <FieldError errors={errors} name="title" />
        </div>
        <div>
          <label htmlFor="excerpt" className="field-label">
            Résumé
          </label>
          <textarea id="excerpt" name="excerpt" rows={2} maxLength={1000} defaultValue={value("excerpt")} className="field-input" />
        </div>
        <div>
          <span className="field-label">Présentation (programme, invités, déroulé…)</span>
          <RichTextEditor name="content_html" defaultValue={values?.content_html ?? event?.content_html ?? ""} uploadFolder="events" />
        </div>
      </div>

      <aside className="space-y-5">
        <div className="card space-y-4 p-5">
          <fieldset>
            <legend className="field-label">Statut</legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="status" value="draft" defaultChecked={(values?.status ?? event?.status ?? "draft") === "draft"} className="accent-[var(--color-accent)]" />
                Brouillon
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="status" value="published" defaultChecked={(values?.status ?? event?.status) === "published"} className="accent-[var(--color-accent)]" />
                Publié
              </label>
            </div>
          </fieldset>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="registration_open"
              defaultChecked={values ? values.registration_open === "on" : (event?.registration_open ?? true)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Inscriptions ouvertes aux membres
          </label>
          <FormMessage state={state} />
          <button type="submit" className="btn btn-accent w-full" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>

        <div className="card space-y-4 p-5">
          <div>
            <label htmlFor="starts_at" className="field-label">
              Début <span className="text-accent">*</span>
            </label>
            <input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={values?.starts_at ?? isoToParisLocal(event?.starts_at)} className="field-input" />
            <FieldError errors={errors} name="starts_at" />
          </div>
          <div>
            <label htmlFor="ends_at" className="field-label">
              Fin
            </label>
            <input id="ends_at" name="ends_at" type="datetime-local" defaultValue={values?.ends_at ?? isoToParisLocal(event?.ends_at)} className="field-input" />
          </div>
          <div>
            <label htmlFor="location" className="field-label">
              Lieu
            </label>
            <input id="location" name="location" placeholder="Lagardère Paris Racing" defaultValue={value("location")} className="field-input" />
          </div>
          <div>
            <label htmlFor="address" className="field-label">
              Adresse
            </label>
            <input id="address" name="address" defaultValue={value("address")} className="field-input" />
          </div>
          <div>
            <label htmlFor="capacity" className="field-label">
              Nombre de places
            </label>
            <input id="capacity" name="capacity" type="number" min={1} defaultValue={value("capacity")} className="field-input" />
            <p className="field-hint">Vide = illimité. Au-delà, les membres passent en liste d&apos;attente.</p>
            <FieldError errors={errors} name="capacity" />
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <ImageUpload name="cover_url" folder="events" defaultUrl={values?.cover_url ?? event?.cover_url} label="Image" hint="Format paysage (16:9)." />
          <div>
            <label htmlFor="slug" className="field-label">
              Adresse de la page
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(changeEvent) => {
                setSlug(changeEvent.target.value);
                setSlugEdited(true);
              }}
              className="field-input font-mono text-xs"
            />
            <p className="field-hint break-all">/evenements-de-amphi/{slug || "…"}</p>
            <FieldError errors={errors} name="slug" />
          </div>
        </div>
      </aside>
    </form>
  );
}
