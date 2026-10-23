// Affiche du HTML déjà nettoyé à l'enregistrement (voir lib/sanitize.ts).
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={`rich-text prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-semibold prose-a:underline-offset-2 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
