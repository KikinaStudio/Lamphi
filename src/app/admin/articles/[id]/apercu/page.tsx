import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { requireAdmin } from "@/lib/auth";
import { POST_CATEGORIES } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";
import { BackLink } from "../../../ui";

export const metadata: Metadata = { title: "Aperçu" };

// Aperçu d'un brouillon ou d'un article programmé (les pages publiques n'affichent que ce qui est en ligne).
export default async function PostPreviewPage({ params }: PageProps<"/admin/articles/[id]/apercu">) {
  const { id } = await params;
  await requireAdmin(`/admin/articles/${id}/apercu`);

  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  const post = data as Post | null;
  if (!post) notFound();

  return (
    <>
      <BackLink href={`/admin/articles/${post.id}`}>Retour à l&apos;édition</BackLink>
      <p className="badge mb-6 bg-accent-soft text-accent-strong">
        Aperçu — {post.status === "draft" ? "brouillon, non publié" : "publication programmée"}
      </p>
      <article className="card max-w-4xl p-6 sm:p-10">
        <p className="eyebrow">{POST_CATEGORIES[post.category].label}</p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt && <p className="mt-5 text-xl leading-relaxed text-muted">{post.excerpt}</p>}
        {post.author_name && (
          <p className="mt-6 font-medium">
            {post.author_name}
            {post.author_title && <span className="font-normal text-muted"> — {post.author_title}</span>}
          </p>
        )}
        <div className="mt-10">
          <PostBody post={post} />
        </div>
      </article>
    </>
  );
}
