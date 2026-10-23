import Image from "next/image";
import type { Post } from "@/lib/types";
import { RichText } from "./rich-text";
import { VideoEmbed } from "./video-embed";

// Corps d'un article : vidéo (ou image de couverture) puis texte.
export function PostBody({ post }: { post: Pick<Post, "title" | "video_url" | "cover_url" | "content_html"> }) {
  return (
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
  );
}
