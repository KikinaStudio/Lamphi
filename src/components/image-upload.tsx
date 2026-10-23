"use client";

import { useRef, useState } from "react";
import { MEDIA_BUCKET } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

const MAX_SIZE = 10 * 1024 * 1024;

// Envoie une image dans Supabase Storage et place son adresse dans un champ caché du formulaire.
export async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("Le fichier doit être une image.");
  if (file.size > MAX_SIZE) throw new Error("L'image dépasse 10 Mo.");

  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw new Error("L'envoi de l'image a échoué. Vérifiez votre connexion et réessayez.");
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function ImageUpload({
  name,
  folder,
  defaultUrl,
  label,
  round = false,
  hint,
}: {
  name: string;
  folder: string;
  defaultUrl?: string | null;
  label: string;
  round?: boolean;
  hint?: string;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      setUrl(await uploadImage(file, folder));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Envoi impossible.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden border border-line bg-paper text-xs text-muted ${
            round ? "h-24 w-24 rounded-full" : "h-24 w-40 rounded-lg"
          }`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            "Aucune image"
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <button type="button" className="btn btn-outline btn-sm whitespace-nowrap" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? "Envoi…" : url ? "Changer l'image" : "Choisir une image"}
          </button>
          {url && !uploading && (
            <button type="button" className="text-xs text-danger hover:underline" onClick={() => setUrl("")}>
              Retirer
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      <input type="hidden" name={name} value={url} />
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
