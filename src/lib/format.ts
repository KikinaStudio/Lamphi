const TIME_ZONE = "Europe/Paris";

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "";
  // Une date seule (AAAA-MM-JJ) est interprétée à midi pour éviter un décalage de fuseau.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatDateTime(value: string | null | undefined) {
  return formatDate(value, { weekday: "long", hour: "2-digit", minute: "2-digit" });
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE }).format(
    new Date(value),
  );
}

export function fullName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`.trim();
}

export function initials(person: { first_name: string; last_name: string }) {
  return `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`.toUpperCase();
}

export function slugify(text: string, maxLength = 80) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

// Valeur d'un <input type="datetime-local"> en heure de Paris → ISO UTC.
export function parisLocalToIso(value: string) {
  if (!value) return null;
  const asUtc = new Date(`${value}:00Z`);
  const parisWallClock = new Date(asUtc.toLocaleString("en-US", { timeZone: TIME_ZONE }));
  const utcWallClock = new Date(asUtc.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(asUtc.getTime() - (parisWallClock.getTime() - utcWallClock.getTime())).toISOString();
}

// ISO UTC → valeur d'un <input type="datetime-local"> en heure de Paris.
export function isoToParisLocal(value: string | null | undefined) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
