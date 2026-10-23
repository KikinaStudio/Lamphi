import { isSupabaseConfigured } from "@/lib/supabase/config";

export function DemoBanner() {
  if (isSupabaseConfigured) return null;
  return (
    <div className="bg-accent-soft text-center text-xs text-ink-soft">
      <p className="container-page py-2">
        Mode démonstration : contenus d&apos;exemple. Renseignez les variables Supabase (voir README) pour activer
        les comptes membres et le back-office.
      </p>
    </div>
  );
}
