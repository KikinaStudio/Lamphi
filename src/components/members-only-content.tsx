"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/lib/types";
import { PostBody } from "./post-body";
import { MembersOnly } from "./ui";

type Content = Pick<Post, "title" | "video_url" | "cover_url" | "content_html">;

// Contenu d'un article réservé : la page reste en cache pour tous, et le texte n'est chargé
// que dans le navigateur d'un membre connecté (la base ne le renvoie qu'aux membres actifs).
export function MembersOnlyContent({ postId, path }: { postId: string; path: string }) {
  const [content, setContent] = useState<Content | null | "loading">(isSupabaseConfigured ? "loading" : null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    let cancelled = false;
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        if (!cancelled) setContent(null);
        return;
      }
      const { data } = await supabase
        .from("posts")
        .select("title, video_url, cover_url, content_html")
        .eq("id", postId)
        .maybeSingle();
      if (!cancelled) setContent((data as Content | null) ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  if (content === "loading") {
    return (
      <div aria-busy className="space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded bg-line" />
        <div className="h-5 w-full animate-pulse rounded bg-line" />
        <div className="h-5 w-5/6 animate-pulse rounded bg-line" />
      </div>
    );
  }
  return content ? <PostBody post={content} /> : <MembersOnly next={path} />;
}
