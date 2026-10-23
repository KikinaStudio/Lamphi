import Link from "next/link";
import { memberNav } from "@/content/site";
import { getViewer, isAdmin } from "@/lib/auth";

export async function MemberNav() {
  const viewer = await getViewer();
  if (!viewer) return null;

  return (
    <div className="border-b border-line bg-surface">
      <div className="container-page flex items-center gap-1 overflow-x-auto py-2 text-sm">
        {memberNav.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-ink-soft hover:bg-paper hover:text-ink">
            {item.label}
          </Link>
        ))}
        {isAdmin(viewer) && (
          <Link href="/admin" className="whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-accent-strong hover:bg-accent-soft">
            Back-office
          </Link>
        )}
        <form action="/auth/deconnexion" method="post" className="ml-auto">
          <button type="submit" className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted hover:text-danger">
            Déconnexion
          </button>
        </form>
      </div>
    </div>
  );
}
