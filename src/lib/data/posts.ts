import "server-only";
import { demoPosts } from "../demo";
import { isSupabaseConfigured } from "../supabase/config";
import { createPublicClient } from "../supabase/public";
import type { Post, PostCategory, PostTeaser } from "../types";

// Lectures publiques (client anonyme) : les pages qui les utilisent restent en cache.
// En cas d'erreur, on lève une exception : le cache garde alors la dernière version valide.

export async function listPostTeasers({
  categories,
  limit = 24,
  offset = 0,
}: {
  categories: PostCategory[];
  limit?: number;
  offset?: number;
}): Promise<{ posts: PostTeaser[]; total: number }> {
  if (!isSupabaseConfigured) {
    const posts = demoPosts.filter((post) => categories.includes(post.category));
    return { posts: posts.slice(offset, offset + limit), total: posts.length };
  }

  const { data, count, error } = await createPublicClient()
    .from("post_teasers")
    .select("*", { count: "exact" })
    .in("category", categories)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return { posts: (data ?? []) as PostTeaser[], total: count ?? 0 };
}

// Aperçu (toujours visible) et contenu complet s'il est public. Le contenu d'un article
// réservé aux membres est chargé dans le navigateur (voir components/members-only-content.tsx).
export async function getPublicPost(
  slug: string,
  categories: PostCategory[],
): Promise<{ teaser: PostTeaser | null; post: Post | null }> {
  if (!isSupabaseConfigured) {
    const teaser = demoPosts.find((post) => post.slug === slug && categories.includes(post.category)) ?? null;
    const post: Post | null =
      teaser && teaser.visibility === "public"
        ? {
            ...teaser,
            content_html: `<p>${teaser.excerpt ?? ""}</p><p>Contenu d'exemple : connectez Supabase pour publier vos articles depuis le back-office.</p>`,
            status: "published",
            created_by: null,
            created_at: teaser.published_at ?? "",
            updated_at: teaser.published_at ?? "",
          }
        : null;
    return { teaser, post };
  }

  const supabase = createPublicClient();
  const [teaserResult, postResult] = await Promise.all([
    supabase.from("post_teasers").select("*").eq("slug", slug).in("category", categories).maybeSingle(),
    supabase.from("posts").select("*").eq("slug", slug).in("category", categories).maybeSingle(),
  ]);
  if (teaserResult.error) throw teaserResult.error;
  if (postResult.error) throw postResult.error;
  return { teaser: teaserResult.data as PostTeaser | null, post: postResult.data as Post | null };
}

// Agenda : événements extérieurs à venir, du plus proche au plus lointain.
export async function listUpcomingAgenda(limit = 6) {
  const today = new Date().toISOString().slice(0, 10);

  if (!isSupabaseConfigured) {
    return demoPosts
      .filter((post) => post.category === "agenda" && (post.event_date ?? "") >= today)
      .slice(0, limit);
  }

  const { data, error } = await createPublicClient()
    .from("post_teasers")
    .select("*")
    .eq("category", "agenda")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PostTeaser[];
}

export async function listRecentPosts(limit = 3, categories?: PostCategory[]) {
  const { posts } = await listPostTeasers({
    categories: categories ?? ["decryptage", "tribune", "interview", "actu", "agenda"],
    limit,
  });
  return posts;
}
