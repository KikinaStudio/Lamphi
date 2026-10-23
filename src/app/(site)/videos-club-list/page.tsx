import type { Metadata } from "next";
import { PostListPage } from "@/components/post-pages";

export const metadata: Metadata = {
  title: "Actus du club",
  description: "Interviews, reportages et temps forts de la vie de L'Amphi en vidéo.",
};

export default function ActusPage({ searchParams }: PageProps<"/videos-club-list">) {
  return (
    <PostListPage
      categories={["actu"]}
      eyebrow="En vidéo"
      title="Actus du club"
      intro="Interviews, reportages et temps forts : la vie de L'Amphi en images."
      basePath="/videos-club-list"
      searchParams={searchParams}
    />
  );
}
