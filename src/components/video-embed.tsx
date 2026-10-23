import { toEmbedUrl } from "@/lib/video";

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = toEmbedUrl(url);
  if (!embedUrl) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
        Voir la vidéo
      </a>
    );
  }
  return (
    <div className="aspect-video overflow-hidden rounded-xl bg-ink">
      <iframe
        src={embedUrl}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
