import Image from "next/image";
import Link from "next/link";
import { POST_CATEGORIES, postPath } from "@/lib/content";
import { formatDate } from "@/lib/format";
import type { PostTeaser } from "@/lib/types";
import { youtubeThumbnail } from "@/lib/video";
import { LockIcon, PlayIcon } from "./icons";

export function PostCard({ post, showCategory = true }: { post: PostTeaser; showCategory?: boolean }) {
  const image = post.cover_url ?? youtubeThumbnail(post.video_url);
  const isVideo = Boolean(post.video_url);

  return (
    <article className="group flex flex-col">
      <Link href={postPath(post)} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-ink">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-end bg-gradient-to-br from-ink to-ink-soft p-5">
              <span className="font-serif text-lg leading-snug text-paper/90">{POST_CATEGORIES[post.category].label}</span>
            </div>
          )}
          {isVideo && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/90 text-ink shadow-lg">
                <PlayIcon />
              </span>
            </span>
          )}
          {post.visibility === "members" && (
            <span className="badge absolute left-3 top-3 bg-ink/85 text-paper">
              <LockIcon /> Membres
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col pt-4">
          <p className="text-xs font-medium text-muted">
            {showCategory && <span className="text-accent-strong">{POST_CATEGORIES[post.category].label} · </span>}
            {post.category === "agenda" && post.event_date
              ? `${formatDate(post.event_date)}${post.location ? ` · ${post.location}` : ""}`
              : formatDate(post.published_at)}
          </p>
          <h3 className="mt-2 text-xl leading-snug group-hover:text-accent-strong">{post.title}</h3>
          {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
          {post.author_name && (
            <p className="mt-3 text-sm font-medium text-ink-soft">
              {post.author_name}
              {post.author_title && <span className="font-normal text-muted"> — {post.author_title}</span>}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}

export function PostGrid({ posts, showCategory }: { posts: PostTeaser[]; showCategory?: boolean }) {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} showCategory={showCategory} />
      ))}
    </div>
  );
}
