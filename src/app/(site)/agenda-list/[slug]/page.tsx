import { PostDetailPage, postMetadata } from "@/components/post-pages";

export async function generateMetadata({ params }: PageProps<"/agenda-list/[slug]">) {
  return postMetadata((await params).slug, ["agenda"]);
}

export default async function AgendaItemPage({ params }: PageProps<"/agenda-list/[slug]">) {
  return (
    <PostDetailPage slug={(await params).slug} categories={["agenda"]} backHref="/la-plume#agenda" backLabel="Agenda" />
  );
}
