import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POST_CATEGORIES, decodeSlug, postPath } from "@/lib/content";
import { getPublicPost, listPostTeasers } from "@/lib/data/posts";
import { formatDate } from "@/lib/format";
import type { PostCategory } from "@/lib/types";
import { CalendarIcon, LinkIcon, PinIcon } from "./icons";
import { LoadMorePosts } from "./load-more-posts";
import { MembersOnlyContent } from "./members-only-content";
import { PostGrid } from "./post-card";
import { PostBody } from "./post-body";
import { EmptyState, PageHeader } from "./ui";

export const POSTS_PAGE_SIZE = 12;

export async function PostListPage({
  categories,
  eyebrow,
  title,
  intro,
}: {
  categories: PostCategory[];
  eyebrow: string;
  title: string;
  intro: string;
}) {
  const { posts, total } = await listPostTeasers({ categories, limit: POSTS_PAGE_SIZE });
  const showCategory = categories.length > 1;

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />
      <section className="container-page py-14">
        {posts.length > 0 ? (
          <PostGrid posts={posts} showCategory={showCategory} />
        ) : (
          <EmptyState>Aucune publication pour le moment.</EmptyState>
        )}
        <LoadMorePosts categories={categories} offset={posts.length} total={total} pageSize={POSTS_PAGE_SIZE} showCategory={showCategory} />
      </section>
    </>
  );
}

export async function postMetadata(slug: string, categories: PostCategory[]): Promise<Metadata> {
  const { teaser } = await getPublicPost(decodeSlug(slug), categories);
  if (!teaser) return {};
  return {
    title: teaser.title,
    description: teaser.excerpt ?? undefined,
    alternates: { canonical: postPath(teaser) },
    openGraph: {
      title: teaser.title,
      description: teaser.excerpt ?? undefined,
      type: "article",
      images: teaser.cover_url ? [teaser.cover_url] : undefined,
    },
  };
}

export async function PostDetailPage({
  slug: rawSlug,
  categories,
  backHref,
  backLabel,
}: {
  slug: string;
  categories: PostCategory[];
  backHref: string;
  backLabel: string;
}) {
  const slug = decodeSlug(rawSlug);
  const { teaser, post } = await getPublicPost(slug, categories);
  const item = post ?? teaser;
  if (!item) notFound();

  const category = POST_CATEGORIES[item.category];

  return (
    <article>
      <header className="border-b border-line">
        <div className="container-page max-w-4xl py-12 sm:py-16">
          <Link href={backHref} className="text-sm font-medium text-accent-strong hover:underline">
            ← {backLabel}
          </Link>
          <p className="eyebrow mt-8">
            {category.label}
            {item.published_at && item.category !== "agenda" && ` · ${formatDate(item.published_at)}`}
          </p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">{item.title}</h1>
          {item.excerpt && <p className="mt-5 text-xl leading-relaxed text-muted">{item.excerpt}</p>}
          {item.author_name && (
            <p className="mt-6 font-medium">
              {item.author_name}
              {item.author_title && <span className="font-normal text-muted"> — {item.author_title}</span>}
            </p>
          )}
          {item.category === "agenda" && (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-ink-soft">
              {item.event_date && (
                <li className="flex items-center gap-2">
                  <CalendarIcon /> {formatDate(item.event_date)}
                </li>
              )}
              {item.location && (
                <li className="flex items-center gap-2">
                  <PinIcon /> {item.location}
                </li>
              )}
              {item.external_url && (
                <li>
                  <a href={item.external_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-accent-strong hover:underline">
                    <LinkIcon /> Site de l&apos;événement
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </header>

      <div className="container-page max-w-4xl py-12">
        {post ? <PostBody post={post} /> : <MembersOnlyContent postId={item.id} path={postPath(item)} />}
      </div>
    </article>
  );
}
