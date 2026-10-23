import Image from "next/image";
import Link from "next/link";
import { eventPath } from "@/lib/content";
import { formatDate, formatTime } from "@/lib/format";
import type { ClubEvent } from "@/lib/types";
import { PinIcon } from "./icons";

export function EventCard({ event }: { event: ClubEvent }) {
  const day = formatDate(event.starts_at, { day: "2-digit", month: undefined, year: undefined });
  const month = formatDate(event.starts_at, { day: undefined, month: "short", year: undefined });

  return (
    <article className="card group overflow-hidden">
      <Link href={eventPath(event)} className="flex h-full flex-col sm:flex-row">
        <div className="relative aspect-[16/9] shrink-0 bg-ink sm:aspect-auto sm:w-56">
          {event.cover_url ? (
            <Image src={event.cover_url} alt="" fill sizes="(min-width: 640px) 14rem, 100vw" className="object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center py-6 text-paper">
              <span className="font-serif text-5xl">{day}</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">{month}</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="eyebrow">
            {formatDate(event.starts_at, { weekday: "long" })} · {formatTime(event.starts_at)}
          </p>
          <h3 className="mt-2 text-xl leading-snug group-hover:text-accent-strong">{event.title}</h3>
          {event.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{event.excerpt}</p>}
          {event.location && (
            <p className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-ink-soft">
              <PinIcon /> {event.location}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
