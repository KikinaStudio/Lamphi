import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POST_CATEGORIES, decodeSlug, postPath } from "@/lib/content";
import { listPostTeasers, getPost } from "@/lib/data/posts";
import { formatDate } from "@/lib/format";
import type { PostCategory } from "@/lib/types";
import { CalendarIcon, LinkIcon, PinIcon } from "./icons";
import { PostGrid } from "./post-card";
import { RichText } from "./rich-text";
import { EmptyState, MembersOnly, PageHeader, Pagination } from "./ui";
import { VideoEmbed } from "./video-embed";

const PAGE_SIZE = 12;

export async function PostListPage({
  categories,
  eyebrow,
  title,
  intro,
  basePath,
  searchParams,
}: {
  categories: PostCategory[];
  eyebrow: string;
  title: string;
  intro: string;
  basePath: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { posts, total } = await listPostTeasers({ categories, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} intro={intro} />
      <section className="container-page py-14">
        {posts.length > 0 ? (
          <PostGrid posts={posts} showCategory={categories.length > 1} />
        ) : (
          <EmptyState>Aucune publication pour le moment.</EmptyState>
        )}
        <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} basePath={basePath} />
      </section>
    </>
  );
}

export async function postMetadata(slug: string, categories: PostCategory[]): Promise<Metadata> {
  const { teaser } = await getPost(decodeSlug(slug), categories);
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
  const { teaser, post } = await getPost(slug, categories);
  const item = post ?? teaser;
  if (!item) notFound();

  const category = POST_CATEGORIES[item.category];
  const isDraft = post && post.status !== "published";

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
          {isDraft && (
            <p className="badge mt-3 bg-accent-soft text-accent-strong">Brouillon — visible uniquement par les admins</p>
          )}
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
        {post ? (
          <>
            {post.video_url ? (
              <div className="mb-10">
                <VideoEmbed url={post.video_url} title={post.title} />
              </div>
            ) : (
              post.cover_url && (
                <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl">
                  <Image src={post.cover_url} alt="" fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover" priority />
                </div>
              )
            )}
            <RichText html={post.content_html} />
          </>
        ) : (
          <MembersOnly next={postPath(item)} />
        )}
      </div>
    </article>
  );
}
