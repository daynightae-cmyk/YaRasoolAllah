export type ReadingSurface = "seerah" | "quran" | "hadith" | "library" | "kids";

export interface ReadingProgressEntry {
  id: string;
  surface: ReadingSurface;
  path: string;
  titleAr: string;
  titleEn: string;
  locationAr: string;
  locationEn: string;
  /** Completed units in this surface, when the surface can prove a count. */
  completed: number | null;
  /** Total units in this surface, when the surface can prove a denominator. */
  total: number | null;
  unitAr: string;
  unitEn: string;
  updatedAt: number;
}

export type ReadingProgressInput = Omit<ReadingProgressEntry, "updatedAt"> & {
  updatedAt?: number;
};

const SURFACES: ReadonlySet<ReadingSurface> = new Set([
  "seerah",
  "quran",
  "hadith",
  "library",
  "kids",
]);

function finiteCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return Math.floor(value);
}

function cleanText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 240) : fallback;
}

function cleanPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path.slice(0, 1_000);
}

/** Sanitizes one untrusted/local-storage entry without inventing progress. */
export function sanitizeReadingProgressEntry(value: unknown): ReadingProgressEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  if (typeof entry.surface !== "string" || !SURFACES.has(entry.surface as ReadingSurface)) return null;

  const id = cleanText(entry.id);
  const path = cleanPath(entry.path);
  const updatedAt = finiteCount(entry.updatedAt);
  if (!id || !path || updatedAt === null) return null;

  const completed = finiteCount(entry.completed);
  const total = finiteCount(entry.total);
  return {
    id,
    surface: entry.surface as ReadingSurface,
    path,
    titleAr: cleanText(entry.titleAr),
    titleEn: cleanText(entry.titleEn),
    locationAr: cleanText(entry.locationAr),
    locationEn: cleanText(entry.locationEn),
    completed,
    total: total !== null && completed !== null && total > 0 && completed <= total ? total : null,
    unitAr: cleanText(entry.unitAr),
    unitEn: cleanText(entry.unitEn),
    updatedAt,
  };
}

export function sanitizeReadingProgress(value: unknown): ReadingProgressEntry[] {
  if (!Array.isArray(value)) return [];
  const entries = value
    .map(sanitizeReadingProgressEntry)
    .filter((entry): entry is ReadingProgressEntry => entry !== null)
    .sort((left, right) => right.updatedAt - left.updatedAt);
  return entries.filter((entry, index, all) => all.findIndex((candidate) => candidate.id === entry.id) === index).slice(0, 40);
}

/**
 * Merges the latest proven state for one reading item. Counts are never
 * increased unless the incoming entry contains a real count; null means that
 * the surface could not prove a denominator.
 */
export function mergeReadingProgress(
  entries: readonly ReadingProgressEntry[],
  incoming: ReadingProgressInput,
): ReadingProgressEntry[] {
  const updatedAt = finiteCount(incoming.updatedAt) ?? Date.now();
  const sanitized = sanitizeReadingProgressEntry({ ...incoming, updatedAt });
  if (!sanitized) return [...entries];

  const previous = entries.find((entry) => entry.id === sanitized.id);
  const merged: ReadingProgressEntry = {
    ...sanitized,
    completed: sanitized.completed ?? previous?.completed ?? null,
    total: sanitized.total ?? previous?.total ?? null,
  };
  if (
    merged.completed !== null &&
    merged.total !== null &&
    (merged.total <= 0 || merged.completed > merged.total)
  ) {
    merged.completed = null;
    merged.total = null;
  }

  return [merged, ...entries.filter((entry) => entry.id !== merged.id)]
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 40);
}

/** Returns a percentage only when both numerator and denominator are proven. */
export function readingProgressPercent(entry: ReadingProgressEntry | null | undefined): number | null {
  if (
    !entry ||
    entry.completed === null ||
    entry.total === null ||
    entry.total <= 0 ||
    entry.completed > entry.total
  ) {
    return null;
  }
  return Math.min(100, Math.max(0, Math.round((entry.completed / entry.total) * 100)));
}

/** The resume target is the most recently updated local reading position. */
export function readingResumeTarget(
  entries: readonly ReadingProgressEntry[],
): ReadingProgressEntry | null {
  return [...entries]
    .filter((entry) => entry.path.startsWith("/") && entry.path !== "/")
    .sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null;
}
