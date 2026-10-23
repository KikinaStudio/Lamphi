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

  return (
    <>
      <BackLink href="/admin/articles">Articles</BackLink>
      <AdminHeader
        title="Modifier l'article"
        actions={
          <>
            <Link href={postPath(post)} target="_blank" className="btn btn-outline btn-sm">
              {post.status === "published" ? "Voir la page ↗" : "Prévisualiser ↗"}
            </Link>
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
