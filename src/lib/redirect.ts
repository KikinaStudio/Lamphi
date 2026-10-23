// N'accepte que des chemins internes (évite les redirections vers un autre site).
export function safeNextPath(next: unknown, fallback = "/espace-membre") {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
