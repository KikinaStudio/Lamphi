"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PostCategory, PostTeaser } from "@/lib/types";
import { PostCard } from "./post-card";

// Suite d'une liste d'articles, chargée à la demande depuis le navigateur :
// la première page reste statique (en cache) sans pagination côté serveur.
export function LoadMorePosts({
  categories,
  offset,
  total,
  pageSize,
  showCategory,
}: {
  categories: PostCategory[];
  offset: number;
  total: number;
  pageSize: number;
  showCategory?: boolean;
}) {
  const [posts, setPosts] = useState<PostTeaser[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const loaded = offset + posts.length;

  async function loadMore() {
    setLoading(true);
    setFailed(false);
    const { data, error } = await createClient()
      .from("post_teasers")
      .select("*")
      .in("category", categories)
      .order("published_at", { ascending: false })
      .range(loaded, loaded + pageSize - 1);
    setLoading(false);
    if (error) setFailed(true);
    else setPosts((current) => [...current, ...((data ?? []) as PostTeaser[])]);
  }

  return (
    <>
      {posts.length > 0 && (
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} showCategory={showCategory} />
          ))}
        </div>
      )}
      {loaded < total && (
        <div className="mt-14 flex flex-col items-center gap-2">
          <button type="button" className="btn btn-outline" onClick={loadMore} disabled={loading}>
            {loading ? "Chargement…" : "Voir plus"}
          </button>
          {failed && <p className="text-sm text-danger">Le chargement a échoué. Réessayez.</p>}
        </div>
      )}
    </>
  );
}
