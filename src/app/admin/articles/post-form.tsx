"use client";

import { useActionState, useState } from "react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/image-upload";
import { FieldError, FormMessage } from "@/components/ui";
import { CATEGORY_ORDER, POST_CATEGORIES } from "@/lib/content";
import { isoToParisLocal, slugify } from "@/lib/format";
import type { FormState, Post, PostCategory } from "@/lib/types";
import { savePost } from "./actions";

export function PostForm({ post, defaultCategory }: { post?: Post; defaultCategory?: PostCategory }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(savePost.bind(null, post?.id ?? null), null);
  const errors = state?.errors;
  const values = state?.values;

  const [category, setCategory] = useState<PostCategory>((values?.category as PostCategory) ?? post?.category ?? defaultCategory ?? "decryptage");
  const [title, setTitle] = useState(values?.title ?? post?.title ?? "");
  const [slug, setSlug] = useState(values?.slug ?? post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(post));

  const showAuthor = category === "tribune" || category === "interview";
  const isAgenda = category === "agenda";
  const value = (name: keyof Post) => values?.[name] ?? (post?.[name] as string | null) ?? "";

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
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugEdited) setSlug(slugify(event.target.value));
            }}
            className="field-input font-serif text-xl"
          />
          <FieldError errors={errors} name="title" />
        </div>

        <div>
          <label htmlFor="excerpt" className="field-label">
            Chapô / résumé
          </label>
          <textarea id="excerpt" name="excerpt" rows={3} maxLength={1000} defaultValue={value("excerpt")} className="field-input" />
          <p className="field-hint">Affiché dans les listes et sur les réseaux sociaux. Toujours visible, même pour un contenu réservé aux membres.</p>
        </div>

        <div>
          <span className="field-label">Texte</span>
          <RichTextEditor name="content_html" defaultValue={values?.content_html ?? post?.content_html ?? ""} uploadFolder="articles" />
          <FieldError errors={errors} name="content_html" />
        </div>
      </div>

      <aside className="space-y-5">
        <div className="card space-y-4 p-5">
          <fieldset>
            <legend className="field-label">Statut</legend>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" name="status" value="draft" defaultChecked={(values?.status ?? post?.status ?? "draft") === "draft"} className="accent-[var(--color-accent)]" />
                Brouillon
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="status" value="published" defaultChecked={(values?.status ?? post?.status) === "published"} className="accent-[var(--color-accent)]" />
                Publié
              </label>
            </div>
          </fieldset>
          <div>
            <label htmlFor="published_at" className="field-label">
              Date de publication
            </label>
            <input id="published_at" name="published_at" type="datetime-local" defaultValue={values?.published_at ?? isoToParisLocal(post?.published_at)} className="field-input" />
            <p className="field-hint">Vide = maintenant. Une date future programme la mise en ligne.</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="members_only"
              defaultChecked={values ? values.members_only === "on" : post?.visibility === "members"}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            Réservé aux membres
          </label>
          <FormMessage state={state} />
          <button type="submit" className="btn btn-accent w-full" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>

        <div className="card space-y-4 p-5">
          <div>
            <label htmlFor="category" className="field-label">
              Rubrique
            </label>
            <select id="category" name="category" value={category} onChange={(event) => setCategory(event.target.value as PostCategory)} className="field-input">
              {CATEGORY_ORDER.map((key) => (
                <option key={key} value={key}>
                  {POST_CATEGORIES[key].label}
                </option>
              ))}
            </select>
            <p className="field-hint">{POST_CATEGORIES[category].description}</p>
          </div>
          <div>
            <label htmlFor="slug" className="field-label">
              Adresse de la page
            </label>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value);
                setSlugEdited(true);
              }}
              className="field-input font-mono text-xs"
            />
            <p className="field-hint break-all">
              {POST_CATEGORIES[category].basePath}/{slug || "…"}
            </p>
            <FieldError errors={errors} name="slug" />
          </div>
        </div>

        <div className="card space-y-4 p-5">
          <ImageUpload name="cover_url" folder="covers" defaultUrl={values?.cover_url ?? post?.cover_url} label="Image de couverture" hint="Format paysage (16:9), 10 Mo maximum." />
          <FieldError errors={errors} name="cover_url" />
          <div>
            <label htmlFor="video_url" className="field-label">
              Vidéo (YouTube ou Vimeo)
            </label>
            <input id="video_url" name="video_url" type="url" placeholder="https://www.youtube.com/watch?v=…" defaultValue={value("video_url")} className="field-input" />
            <FieldError errors={errors} name="video_url" />
          </div>
        </div>

        {showAuthor && (
          <div className="card space-y-4 p-5">
            <div>
              <label htmlFor="author_name" className="field-label">
                {category === "interview" ? "Personne interviewée" : "Auteur"}
              </label>
              <input id="author_name" name="author_name" defaultValue={value("author_name")} className="field-input" />
            </div>
            <div>
              <label htmlFor="author_title" className="field-label">
                Fonction / organisation
              </label>
              <input id="author_title" name="author_title" defaultValue={value("author_title")} className="field-input" />
            </div>
          </div>
        )}
        {!showAuthor && (
          <>
            <input type="hidden" name="author_name" value={value("author_name")} />
            <input type="hidden" name="author_title" value={value("author_title")} />
          </>
        )}

        {isAgenda ? (
          <div className="card space-y-4 p-5">
            <div>
              <label htmlFor="event_date" className="field-label">
                Date de l&apos;événement <span className="text-accent">*</span>
              </label>
              <input id="event_date" name="event_date" type="date" defaultValue={value("event_date")} className="field-input" />
              <FieldError errors={errors} name="event_date" />
            </div>
            <div>
              <label htmlFor="location" className="field-label">
                Lieu
              </label>
              <input id="location" name="location" defaultValue={value("location")} className="field-input" />
            </div>
            <div>
              <label htmlFor="external_url" className="field-label">
                Site de l&apos;événement
              </label>
              <input id="external_url" name="external_url" type="url" defaultValue={value("external_url")} className="field-input" />
              <FieldError errors={errors} name="external_url" />
            </div>
          </div>
        ) : (
          <>
            <input type="hidden" name="event_date" value="" />
            <input type="hidden" name="location" value="" />
            <input type="hidden" name="external_url" value="" />
          </>
        )}
      </aside>
    </form>
  );
}
