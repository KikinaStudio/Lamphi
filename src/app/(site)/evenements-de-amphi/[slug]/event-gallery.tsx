"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { EventPhoto } from "@/lib/types";

// Galerie réservée aux membres : la base ne renvoie les photos qu'aux membres actifs connectés.
export function EventGallery({ eventId }: { eventId: string }) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;
      const { data } = await supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", eventId)
        .order("position")
        .order("created_at");
      if (!cancelled) setPhotos((data ?? []) as EventPhoto[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (photos.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="text-3xl">Galerie photos</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-square overflow-hidden rounded-lg">
            <Image src={photo.url} alt={photo.caption ?? ""} fill sizes="(min-width: 640px) 33vw, 50vw" className="object-cover transition hover:scale-105" />
          </a>
        ))}
      </div>
    </section>
  );
}
