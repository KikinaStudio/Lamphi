"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/components/image-upload";
import { FormMessage } from "@/components/ui";
import type { FormState } from "@/lib/types";
import { addEventPhotos } from "../actions";

export function PhotoUploader({ eventId }: { eventId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [state, setState] = useState<FormState>(null);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setState(null);
    const urls: string[] = [];
    const failures: string[] = [];
    for (const [index, file] of files.entries()) {
      setProgress(`Envoi ${index + 1} / ${files.length}…`);
      try {
        urls.push(await uploadImage(file, `events/${eventId}`));
      } catch {
        failures.push(file.name);
      }
    }
    setProgress(null);

    const result = urls.length > 0 ? await addEventPhotos(eventId, urls) : { ok: false, message: "Aucune photo n'a pu être envoyée." };
    setState(
      failures.length > 0 && result
        ? { ok: false, message: `${result.message ?? ""} Échec pour : ${failures.join(", ")}.` }
        : result,
    );
  }

  return (
    <div className="space-y-3">
      <button type="button" className="btn btn-primary btn-sm" disabled={progress !== null} onClick={() => input.current?.click()}>
        {progress ?? "Ajouter des photos"}
      </button>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      <FormMessage state={state} />
    </div>
  );
}
