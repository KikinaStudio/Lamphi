import Link from "next/link";
import type { ReactNode } from "react";

export function AdminHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-block text-sm font-medium text-accent-strong hover:underline">
      ← {children}
    </Link>
  );
}

export function Tabs({ tabs, current }: { tabs: { href: string; label: string; key: string; count?: number }[]; current: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            tab.key === current ? "bg-ink text-paper" : "border border-line bg-surface text-ink-soft hover:border-ink"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ml-1.5 opacity-70">{tab.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function StatusBadge({ tone, children }: { tone: "success" | "warning" | "muted" | "danger"; children: ReactNode }) {
  const tones = {
    success: "bg-success/10 text-success",
    warning: "bg-accent-soft text-accent-strong",
    muted: "bg-line/60 text-muted",
    danger: "bg-danger/10 text-danger",
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}
