/**
 * Institution world plates — cinematic environments per wing (2026 pack).
 *
 * Every navigation wing owns one cinematic world plate derived from the
 * owner-approved 2026 reference pack (02_ENVIRONMENT_ART), converted by
 * `scripts/build-world-plates.mjs` into production WebP under
 * `/visual-golden/art/worlds/` with SHA-256 provenance in worlds/manifest.json.
 *
 * Honesty contract:
 * - Plates are illustrative artwork for atmosphere only: no depiction of the
 *   Prophet ﷺ, companions, or any sacred personality; not archaeological
 *   documentation.
 * - This registry references canonical wing ids from workspace.ts and never
 *   duplicates historical facts or content data.
 * - June-2025 attached_assets artwork is obsolete and must not be referenced
 *   here or substituted for these plates.
 */

import type { InstitutionWingId } from "./workspace";

export interface WorldPlateDefinition {
  /** Canonical navigation wing that owns this world. */
  wing: InstitutionWingId;
  /** Production plate URL (served from client/public). */
  plate: string;
  /** Reference pack source path, for provenance display and audits. */
  reference: string;
}

const WORLD_PLATES: Record<InstitutionWingId, WorldPlateDefinition> = {
  home: {
    wing: "home",
    plate: "/visual-golden/art/worlds/home.webp",
    reference: "02_ENVIRONMENT_ART/10_home.png",
  },
  library: {
    wing: "library",
    plate: "/visual-golden/art/worlds/library.webp",
    reference: "02_ENVIRONMENT_ART/01_library.png",
  },
  seerah: {
    wing: "seerah",
    plate: "/visual-golden/art/worlds/seerah.webp",
    reference: "02_ENVIRONMENT_ART/09_seerah.png",
  },
  hadith: {
    wing: "hadith",
    plate: "/visual-golden/art/worlds/hadith.webp",
    reference: "02_ENVIRONMENT_ART/08_hadith.png",
  },
  quran: {
    wing: "quran",
    plate: "/visual-golden/art/worlds/quran.webp",
    reference: "02_ENVIRONMENT_ART/07_quran.png",
  },
  atlas: {
    wing: "atlas",
    plate: "/visual-golden/art/worlds/atlas.webp",
    reference: "02_ENVIRONMENT_ART/05_atlas.png",
  },
  kids: {
    wing: "kids",
    plate: "/visual-golden/art/worlds/kids.webp",
    reference: "02_ENVIRONMENT_ART/06_children.png",
  },
  daily: {
    wing: "daily",
    plate: "/visual-golden/art/worlds/daily.webp",
    reference: "02_ENVIRONMENT_ART/04_daily.png",
  },
  audio: {
    wing: "audio",
    plate: "/visual-golden/art/worlds/audio.webp",
    reference: "02_ENVIRONMENT_ART/03_audio.png",
  },
  basirah: {
    wing: "basirah",
    // The research desk lives inside the sources vault world until the pack
    // grows a dedicated basirah plate; the mapping stays explicit, not guessed.
    plate: "/visual-golden/art/worlds/sources.webp",
    reference: "02_ENVIRONMENT_ART/02_sources.png",
  },
  sources: {
    wing: "sources",
    plate: "/visual-golden/art/worlds/sources.webp",
    reference: "02_ENVIRONMENT_ART/02_sources.png",
  },
  practice: {
    wing: "practice",
    plate: "/visual-golden/art/worlds/daily.webp",
    reference: "02_ENVIRONMENT_ART/04_daily.png",
  },
  reference: {
    wing: "reference",
    plate: "/visual-golden/art/worlds/sources.webp",
    reference: "02_ENVIRONMENT_ART/02_sources.png",
  },
};

/** Resolve the cinematic world plate for a wing. */
export function worldPlateForWing(wing: InstitutionWingId): WorldPlateDefinition {
  return WORLD_PLATES[wing];
}

/** All world definitions (canonical order = registry insertion order). */
export function listWorldPlates(): WorldPlateDefinition[] {
  return Object.values(WORLD_PLATES);
}
