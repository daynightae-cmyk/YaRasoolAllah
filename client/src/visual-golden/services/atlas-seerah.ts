/**
 * Bridge between the schematic Living Atlas and the chronological Seerah
 * database.
 *
 * The atlas remains the only map surface. This module only resolves:
 * - an atlas node from a deep-link query (id or Arabic place name),
 * - the recorded Seerah place behind that node (when `atlasName` matches),
 * - the chronologically ordered events recorded at that place,
 * - the Seerah event behind a documented Living Atlas campaign.
 *
 * No coordinate is invented here, and no event is attached to a place unless
 * the database already records that `placeId`.
 */

import { ATLAS_NODES, type AtlasNode } from "@/visual-golden/services/atlas";
import { SEERAH_DATABASE } from "@/visual-golden/services/seerah-database";
import { seerahChapters } from "@/data/seerahData";
import type { SeerahEvent, SeerahPlace } from "@/data/seerah/types";

export interface AtlasSeerahEvent {
  id: string;
  order: number;
  titleAr: string;
  yearAH: number | null;
  yearCE: number | null;
  dateTextAr: string;
  eraTitleAr: string;
  chapterTitleAr: string;
  quranCount: number;
  hadithCount: number;
  sourceCount: number;
  href: string;
}

const ERA_TITLE_BY_ID = new Map(SEERAH_DATABASE.eras.map((era) => [era.id, era.titleAr]));
const CHAPTER_TITLE_BY_ID = new Map(seerahChapters.map((chapter) => [chapter.id, chapter.title]));
const EVENT_BY_ID = new Map(SEERAH_DATABASE.events.map((event) => [event.id, event]));

/** The four Living Atlas campaigns that have a matching Seerah database event. */
const CAMPAIGN_EVENT_ID: Record<string, string> = {
  badr: "badr",
  uhud: "uhud",
  khandaq: "khandaq",
  fath: "mecca-conquest",
};

/**
 * Resolve `?place=` against the atlas node id or the Arabic place name.
 * The Seerah database writes the human-readable name, while older Seerah
 * links wrote the node id; both must keep working.
 */
export function findAtlasNodeByQuery(query: string | null | undefined): AtlasNode | null {
  if (!query) return null;
  const value = query.trim();
  if (!value) return null;
  return ATLAS_NODES.find((node) => node.id === value || node.name === value) ?? null;
}

/** The Seerah place whose `atlasName` matches this atlas node, if recorded. */
export function seerahPlaceForAtlasNode(node: AtlasNode): SeerahPlace | null {
  return (
    SEERAH_DATABASE.places.find((place) => place.atlasName === node.name) ?? null
  );
}

/**
 * Events recorded at this node's place, in canonical chronological order.
 * Returns an empty list when the database records no place link, rather than
 * borrowing events from a similar-sounding location.
 */
export function seerahEventsForAtlasNode(node: AtlasNode): AtlasSeerahEvent[] {
  const place = seerahPlaceForAtlasNode(node);
  if (!place) return [];
  return SEERAH_DATABASE.events
    .filter((event) => event.placeId === place.id)
    .sort((a, b) => a.order - b.order)
    .map(toAtlasSeerahEvent);
}

function toAtlasSeerahEvent(event: SeerahEvent): AtlasSeerahEvent {
  return {
    id: event.id,
    order: event.order,
    titleAr: event.titleAr,
    yearAH: event.yearAH,
    yearCE: event.yearCE,
    dateTextAr: event.dateTextAr,
    eraTitleAr: ERA_TITLE_BY_ID.get(event.eraId) ?? event.eraId,
    chapterTitleAr: CHAPTER_TITLE_BY_ID.get(event.chapterId) ?? event.chapterId,
    quranCount: event.quranRefs.length,
    hadithCount: event.hadithRefs.length,
    sourceCount: event.sources.length,
    href: `/seerah/database?event=${encodeURIComponent(event.id)}`,
  };
}

/** The Seerah event behind a documented campaign, when one is recorded. */
export function seerahEventForCampaign(campaignId: string): SeerahEvent | null {
  const eventId = CAMPAIGN_EVENT_ID[campaignId];
  return eventId ? EVENT_BY_ID.get(eventId) ?? null : null;
}

/** Deep link to the chronological record for a campaign. */
export function campaignSeerahHref(campaignId: string): string | null {
  const event = seerahEventForCampaign(campaignId);
  return event ? `/seerah/database?event=${encodeURIComponent(event.id)}` : null;
}

/** Deep link to the editorial chapter/event for a campaign. */
export function campaignChapterHref(campaignId: string): string | null {
  const event = seerahEventForCampaign(campaignId);
  if (!event) return null;
  return `/seerah?chapter=${encodeURIComponent(event.chapterId)}&event=${encodeURIComponent(event.id)}`;
}

/** Deep link to the database filtered to one recorded place. */
export function atlasPlaceDatabaseHref(place: SeerahPlace): string {
  return `/seerah/database?place=${encodeURIComponent(place.id)}`;
}

/** Deep link back to the atlas for a Seerah place. */
export function atlasHrefForPlace(place: SeerahPlace): string | null {
  if (!place.atlasName) return null;
  return `/atlas?place=${encodeURIComponent(place.atlasName)}`;
}
