/**
 * Canonical public-shell routing contract.
 *
 * VisualInstitutionShell owns header, main landmark, footer, and mobile nav
 * for public knowledge routes. AppLayout remains only for intentional
 * administration / notification-settings exceptions.
 */

export const CANONICAL_VISUAL_PATHS = [
  "/",
  "/library",
  "/digital-library",
  "/books",
  "/quran",
  "/tafsir",
  "/seerah",
  "/atlas",
  "/sunnah",
  "/hadith",
  "/kids",
  "/children-tv",
  "/daily",
  "/quran-audio",
  "/audio",
  "/basirah",
  "/sources",
  "/ai-assistant",
  "/al-mufti-al-mubeen",
  "/who-is-muhammad",
  "/character",
  "/prophetic-day",
  "/24-hours",
  "/daily-verse",
  "/prayer-guide",
  "/islamic-knowledge",
  "/five-pillars",
  "/women-in-islam",
  "/calendar",
  "/digital-tasbih",
  "/qibla-compass",
] as const;

export const CANONICAL_VISUAL_PREFIXES = [
  "/library/work/",
  "/who-is-muhammad/",
] as const;

/** Routes that keep the legacy AppLayout by design, not by neglect. */
export const INTENTIONAL_APP_LAYOUT_PATHS = [
  "/dashboard",
  "/bab-alsamaa-settings",
] as const;

export type CanonicalVisualPath = (typeof CANONICAL_VISUAL_PATHS)[number];
export type IntentionalAppLayoutPath = (typeof INTENTIONAL_APP_LAYOUT_PATHS)[number];

export function isCanonicalVisualPath(path: string): boolean {
  if ((CANONICAL_VISUAL_PATHS as readonly string[]).includes(path)) return true;
  return CANONICAL_VISUAL_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function isIntentionalAppLayoutPath(path: string): boolean {
  return (INTENTIONAL_APP_LAYOUT_PATHS as readonly string[]).includes(path);
}
