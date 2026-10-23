import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { requireAdmin } from "@/lib/auth";
import { postPath } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { AdminHeader, BackLink } from "../../ui";
import { deletePost } from "../actions";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Modifier l'article" };

export default async function EditPostPage({ params, searchParams }: PageProps<"/admin/articles/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/articles/${id}`);
  const justCreated = (await searchParams).enregistre === "1";

  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  const post = data as Post | null;
  if (!post) notFound();
  const isLive = post.status === "published" && Boolean(post.published_at) && new Date(post.published_at!) <= new Date();

  return (
    <>
      <BackLink href="/admin/articles">Articles</BackLink>
      <AdminHeader
        title="Modifier l'article"
        actions={
          <>
            {isLive ? (
              <Link href={postPath(post)} target="_blank" className="btn btn-outline btn-sm">
                Voir la page ↗
              </Link>
            ) : (
              <Link href={`/admin/articles/${post.id}/apercu`} className="btn btn-outline btn-sm">
                Aperçu
              </Link>
            )}
            <ConfirmButton action={deletePost.bind(null, post.id)} message="Supprimer définitivement cet article ?">
              Supprimer
            </ConfirmButton>
          </>
        }
      />
      {justCreated && (
        <p className="mb-6 rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
          {post.status === "published" ? "Article créé et publié." : "Brouillon créé."}
        </p>
      )}
      <PostForm post={post} />
    </>
  );
}
