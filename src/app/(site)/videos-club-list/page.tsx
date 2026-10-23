import type { Metadata } from "next";
import { PostListPage } from "@/components/post-pages";

// Page en cache, régénérée au plus toutes les 5 minutes et dès qu'un contenu change dans le back-office.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Actus du club",
  description: "Interviews, reportages et temps forts de la vie de L'Amphi en vidéo.",
};

export default function ActusPage() {
  return (
    <PostListPage
      categories={["actu"]}
      eyebrow="En vidéo"
      title="Actus du club"
      intro="Interviews, reportages et temps forts : la vie de L'Amphi en images."
    />
  );
}
