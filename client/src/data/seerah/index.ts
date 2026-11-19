import { SEERAH_ERAS } from "./eras";
import { SEERAH_EVENTS_MAKKAH } from "./events-makkah";
import { SEERAH_EVENTS_MADINAH } from "./events-madinah";
import { SEERAH_PEOPLE } from "./people";
import { SEERAH_PLACES } from "./places";
import { SEERAH_SOURCES } from "./sources";
import type { SeerahDatabase, SeerahEvent } from "./types";

/**
 * Single canonical assembly point. The Makkah and Madinah files stay split
 * only for authoring ergonomics; consumers import from here so ordering and
 * counts cannot drift between surfaces.
 */
export const SEERAH_EVENTS: SeerahEvent[] = [
  ...SEERAH_EVENTS_MAKKAH,
  ...SEERAH_EVENTS_MADINAH,
].sort((a, b) => a.order - b.order);

export const SEERAH_DATABASE: SeerahDatabase = {
  eras: SEERAH_ERAS,
  events: SEERAH_EVENTS,
  people: SEERAH_PEOPLE,
  places: SEERAH_PLACES,
  sources: SEERAH_SOURCES,
};

function countQuranRefs(): number {
  return SEERAH_EVENTS.reduce((total, event) => total + event.quranRefs.length, 0);
}

function countHadithRefs(): number {
  return SEERAH_EVENTS.reduce((total, event) => total + event.hadithRefs.length, 0);
}

function countEventsWithQuran(): number {
  return SEERAH_EVENTS.filter((event) => event.quranRefs.length > 0).length;
}

function countEventsWithHadith(): number {
  return SEERAH_EVENTS.filter((event) => event.hadithRefs.length > 0).length;
}

export const SEERAH_DATABASE_COUNTS = {
  eras: SEERAH_ERAS.length,
  events: SEERAH_EVENTS.length,
  people: SEERAH_PEOPLE.length,
  places: SEERAH_PLACES.length,
  sources: SEERAH_SOURCES.length,
  quranRefs: countQuranRefs(),
  hadithRefs: countHadithRefs(),
  eventsWithQuran: countEventsWithQuran(),
  eventsWithHadith: countEventsWithHadith(),
} as const;

const eventById = new Map(SEERAH_EVENTS.map((event) => [event.id, event]));
const eraById = new Map<string, (typeof SEERAH_ERAS)[number]>(
  SEERAH_ERAS.map((era) => [era.id, era]),
);
const personById = new Map(SEERAH_PEOPLE.map((person) => [person.id, person]));
const placeById = new Map(SEERAH_PLACES.map((place) => [place.id, place]));
const sourceById = new Map(SEERAH_SOURCES.map((source) => [source.id, source]));

export function getSeerahEvent(id: string): SeerahEvent | null {
  return eventById.get(id) ?? null;
}

export function getSeerahEra(id: string) {
  return eraById.get(id) ?? null;
}

export function getSeerahPerson(id: string) {
  return personById.get(id) ?? null;
}

export function getSeerahPlace(id: string) {
  return placeById.get(id) ?? null;
}

export function getSeerahSource(id: string) {
  return sourceById.get(id) ?? null;
}

export function getEventsForEra(eraId: string): SeerahEvent[] {
  return SEERAH_EVENTS.filter((event) => event.eraId === eraId);
}

export function getEventsForPerson(personId: string): SeerahEvent[] {
  return SEERAH_EVENTS.filter((event) => event.peopleIds.includes(personId));
}

export function getEventsForPlace(placeId: string): SeerahEvent[] {
  return SEERAH_EVENTS.filter((event) => event.placeId === placeId);
}

export function getEventsForSource(sourceId: string): SeerahEvent[] {
  return SEERAH_EVENTS.filter((event) =>
    event.sources.some((citation) => citation.sourceId === sourceId),
  );
}
