/**
 * Seerah cinematic world registry — 2026 immersive reference scenes.
 *
 * Ten cinematic plates from the owner-approved reference pack
 * (03_IMMERSIVE_SEERAH), converted by `scripts/build-world-plates.mjs` into
 * production WebP under `/visual-golden/art/worlds/seerah/` with SHA-256
 * provenance in worlds/manifest.json.
 *
 * This registry only maps *visual scene settings* onto canonical chapter and
 * event ids from `client/src/data/seerahData.ts` and the existing
 * seerah-scene / seerah-ghazawat registries. It never duplicates historical
 * facts.
 *
 * Honesty contract (unchanged from the scene registries):
 * - No prophetic depiction, no companions, no combatants, no gore.
 * - Plates are illustrative environmental artwork, not archaeological or
 *   documentary evidence; the Arabic reconstruction disclosure of the owning
 *   scene config is always rendered alongside the plate.
 * - Chapters/events without a dedicated cinematic plate fall back to their
 *   existing schematic SVG plate — never to obsolete June-2025 artwork.
 */

/** Cinematic scene ids produced by the world plate pipeline. */
export type SeerahWorldId =
  | "makkah-before-islam"
  | "hira"
  | "hijrah-overview"
  | "hijrah-night"
  | "hijrah-thawr"
  | "hijrah-desert"
  | "madinah-walk"
  | "badr"
  | "badr-timeline"
  | "fath-makkah";

const WORLD_BASE = "/visual-golden/art/worlds/seerah";

export function seerahWorldPlate(world: SeerahWorldId): string {
  return `${WORLD_BASE}/${world}.webp`;
}

/** Chapter id -> cinematic world (chapters without a plate stay schematic). */
const CHAPTER_WORLDS: Partial<Record<string, SeerahWorldId>> = {
  "birth-and-upbringing": "makkah-before-islam",
  "prophethood-beginning": "hira",
  "hijra-to-madinah": "hijrah-overview",
  "establishing-state": "madinah-walk",
  "battles-conquests": "badr",
};

/**
 * Event id -> cinematic world. Events not listed here keep their existing
 * schematic plate from the ghazawat registry (uhud, khandaq, khaybar, hunayn,
 * tabuk) — no cinematic plate exists for them in the approved pack.
 */
const EVENT_WORLDS: Partial<Record<string, SeerahWorldId>> = {
  "hijra-start": "hijrah-night",
  "cave-thawr": "hijrah-thawr",
  "arrival-quba": "hijrah-desert",
  "arrival-madinah": "madinah-walk",
  "mosque-building": "madinah-walk",
  badr: "badr",
  "mecca-conquest": "fath-makkah",
};

/** Resolve the cinematic plate for a chapter, or null to keep the SVG plate. */
export function chapterWorldPlate(chapterId: string): string | null {
  const world = CHAPTER_WORLDS[chapterId];
  return world ? seerahWorldPlate(world) : null;
}

/** Resolve the cinematic plate for a station/battle event, or null. */
export function eventWorldPlate(eventId: string): string | null {
  const world = EVENT_WORLDS[eventId];
  return world ? seerahWorldPlate(world) : null;
}

/**
 * Battle timeline plate (03_IMMERSIVE_SEERAH badr_timeline) — used by the
 * battles chapter reading environment as its orienting map-style artwork.
 */
export function battlesTimelinePlate(): string {
  return seerahWorldPlate("badr-timeline");
}
