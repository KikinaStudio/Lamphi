import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { CATEGORY_ORDER } from "@/lib/content";
import { AdminHeader, BackLink } from "../../ui";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Nouvel article" };

export default async function NewPostPage({ searchParams }: PageProps<"/admin/articles/nouveau">) {
  await requireAdmin("/admin/articles/nouveau");
  const { rubrique } = await searchParams;
  const defaultCategory = CATEGORY_ORDER.find((key) => key === rubrique);

  return (
    <>
      <BackLink href="/admin/articles">Articles</BackLink>
      <AdminHeader title="Nouvel article" />
      <PostForm defaultCategory={defaultCategory} />
    </>
  );
}
