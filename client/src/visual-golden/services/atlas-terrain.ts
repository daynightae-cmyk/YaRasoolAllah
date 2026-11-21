/**
 * Atlas observer terrains — genuine 3D observation of campaign landscapes.
 *
 * The Living Atlas theatre's plate mode is an illustrated schematic map
 * (2.5D zoom is an artistic transition, labeled as such). This module adds
 * the directive's *real spatial movement* path: each campaign's schematic
 * markers become linked observer stations inside a procedural Three.js
 * terrain built by TerrainTheatre3D.
 *
 * Honesty contract (unchanged from living-atlas.ts):
 * - Marker x/y are illustration layout slots, never GPS. The 3D station
 *   positions derived from them are equally schematic — the scene says so.
 * - No army placement, no combat, no people, no prophetic depiction.
 * - Station notes reuse the marker's own sourced description; no new facts.
 * - Historical records stay in the Seerah database; deep links unchanged.
 */

import type { Campaign } from "@/visual-golden/data/living-atlas";
import type { TerrainKind, TerrainSceneConfig } from "./seerah-terrain";

/** Campaign id -> terrain family (the kind of place the sources describe). */
const CAMPAIGN_KIND: Record<string, TerrainKind> = {
  badr: "valley",
  uhud: "mountain",
  khandaq: "trench",
  fath: "settlement",
};

/** Campaign id -> canonical Seerah event whose terrain palette we share. */
const CAMPAIGN_EVENT: Record<string, string> = {
  badr: "badr",
  uhud: "uhud",
  khandaq: "khandaq",
  fath: "mecca-conquest",
};

/** Palette per campaign, consistent with the Seerah terrain registry. */
const CAMPAIGN_PALETTE: Record<string, { sky: string; fog: string; ground: string; rock: string; sun: string }> = {
  badr: { sky: "#2c2214", fog: "#42331d", ground: "#8f7355", rock: "#6e5a45", sun: "#ffdf9e" },
  uhud: { sky: "#2a1f14", fog: "#3d2c1a", ground: "#6b5136", rock: "#7d6248", sun: "#ffd9a0" },
  khandaq: { sky: "#0b1020", fog: "#131a2e", ground: "#4a4038", rock: "#5c544a", sun: "#9fb4ff" },
  fath: { sky: "#33281a", fog: "#4c3d26", ground: "#8a6f52", rock: "#6e5138", sun: "#ffe9b8" },
};

/**
 * Map an illustration layout slot (percent of the plate) to a schematic
 * scene-local observer position. The mapping is deterministic and purely
 * presentational: it spreads stations across the terrain so the visitor can
 * travel between them; it claims no geographic accuracy.
 */
function stationPosition(x: number, y: number, index: number): [number, number, number] {
  const sx = (x / 100 - 0.5) * 44;
  const sz = (y / 100 - 0.5) * 44;
  // Alternate eye heights slightly so stations on flat ground still read
  // as distinct viewpoints; all stay human-scale.
  const dy = 1.7 + (index % 3) * 0.5;
  return [sx, dy, sz];
}

/**
 * Build a terrain scene for a campaign, or null when the campaign has no
 * registered terrain family (the plate theatre remains the only mode).
 */
export function atlasCampaignTerrain(campaign: Campaign): TerrainSceneConfig | null {
  const kind = CAMPAIGN_KIND[campaign.id];
  const palette = CAMPAIGN_PALETTE[campaign.id];
  const eventId = CAMPAIGN_EVENT[campaign.id];
  if (!kind || !palette || !eventId) return null;
  if (campaign.markers.length === 0) return null;

  const nodes = campaign.markers.map((marker, index) => {
    const position = stationPosition(marker.x, marker.y, index);
    // Look toward the scene centre from each station so arrival always
    // frames the landscape; the visitor then drags to look around.
    const lookAt: [number, number, number] = [-position[0] * 0.4, 2.2, -position[2] * 0.4];
    return {
      id: marker.id,
      labelAr: marker.labelAr,
      noteAr: marker.descriptionAr,
      position,
      lookAt,
    };
  });

  return {
    eventId,
    kind,
    seed: 4000 + campaign.id.length * 131 + campaign.markers.length * 17,
    ...palette,
    nodes,
    disclosureAr:
      "مشهد ثلاثي الأبعاد تخطيطي لتضاريس الحملة — مواضع العلامات مستخرجة من تخطيط اللوحة الفنية وليست إحداثيات، ولا نشر للجيوش ولا تجسيد ولا قتال.",
  };
}
