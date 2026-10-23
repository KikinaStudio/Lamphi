import { Suspense } from "react";
import { MemberNav } from "@/components/member-nav";

export default function MemberLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Suspense fallback={<div className="h-12 border-b border-line bg-surface" />}>
        <MemberNav />
      </Suspense>
      {children}
    </>
  );
}
