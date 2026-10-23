import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { CATEGORY_ORDER, POST_CATEGORIES, postPath } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Post, PostCategory } from "@/lib/types";
import { AdminHeader, StatusBadge, Tabs } from "../ui";

export const metadata: Metadata = { title: "Articles" };

type Row = Pick<Post, "id" | "slug" | "title" | "category" | "status" | "visibility" | "published_at" | "updated_at">;

export default async function PostsAdminPage({ searchParams }: PageProps<"/admin/articles">) {
  await requireAdmin("/admin/articles");
  const params = await searchParams;
  const category = CATEGORY_ORDER.find((key) => key === params.rubrique);
  const status = params.statut === "draft" || params.statut === "published" ? params.statut : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id, slug, title, category, status, visibility, published_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  const { data } = await query;
  const posts = (data ?? []) as Row[];
  const now = new Date().toISOString();

  const tabHref = (key?: PostCategory) => `/admin/articles${key ? `?rubrique=${key}` : ""}`;

  return (
    <>
      <AdminHeader
        title="Articles"
        description="Décryptages, tribunes, interviews, actus vidéo et agenda."
        actions={
          <Link href={`/admin/articles/nouveau${category ? `?rubrique=${category}` : ""}`} className="btn btn-accent btn-sm">
            + Nouvel article
          </Link>
        }
      />
      <Tabs
        current={category ?? "all"}
        tabs={[
          { key: "all", label: "Tout", href: tabHref() },
          ...CATEGORY_ORDER.map((key) => ({ key, label: POST_CATEGORIES[key].plural, href: tabHref(key) })),
        ]}
      />

      <div className="card divide-y divide-line">
        {posts.map((post) => {
          const scheduled = post.status === "published" && post.published_at && post.published_at > now;
          return (
            <div key={post.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href={`/admin/articles/${post.id}`} className="font-semibold hover:text-accent-strong">
                  {post.title}
                </Link>
                <p className="mt-0.5 text-xs text-muted">
                  {POST_CATEGORIES[post.category].label} · modifié le {formatDate(post.updated_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {post.visibility === "members" && <StatusBadge tone="muted">Membres</StatusBadge>}
                {post.status === "draft" ? (
                  <StatusBadge tone="warning">Brouillon</StatusBadge>
                ) : scheduled ? (
                  <StatusBadge tone="warning">Programmé le {formatDate(post.published_at)}</StatusBadge>
                ) : (
                  <StatusBadge tone="success">Publié</StatusBadge>
                )}
                {post.status === "published" && !scheduled ? (
                  <Link href={postPath(post)} target="_blank" className="text-xs text-accent-strong hover:underline">
                    Voir ↗
                  </Link>
                ) : (
                  <Link href={`/admin/articles/${post.id}/apercu`} className="text-xs text-accent-strong hover:underline">
                    Aperçu
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {posts.length === 0 && <p className="px-5 py-10 text-center text-muted">Aucun article pour le moment.</p>}
      </div>
    </>
  );
}
