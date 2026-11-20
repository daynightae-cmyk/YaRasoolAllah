import { art } from "@/visual-golden/mock/art";
import { seerahChapters } from "@/data/seerahData";
import { HADITH_DEVELOPMENT_SAMPLES, type HadithRecord } from "@/data/hadithData";
import { UTHMANI_VERSES } from "@/data/quranCorpus";
import {
  SEERAH_DATABASE,
  SEERAH_DATABASE_COUNTS,
  SEERAH_EVENTS,
  getSeerahEvent,
  getSeerahEra,
  getSeerahPerson,
  getSeerahPlace,
  getSeerahSource,
} from "@/data/seerah";
import type {
  SeerahCertainty,
  SeerahEra,
  SeerahEraId,
  SeerahEvent,
  SeerahHadithRef,
  SeerahIntegrityIssue,
  SeerahPerson,
  SeerahPlace,
  SeerahQuranRef,
  SeerahSource,
} from "@/data/seerah/types";

export { SEERAH_DATABASE, SEERAH_DATABASE_COUNTS } from "@/data/seerah";
export type { SeerahEvent, SeerahPerson, SeerahPlace, SeerahSource, SeerahEra };

const LOCAL_SAMPLE_BY_ID = new Map(
  HADITH_DEVELOPMENT_SAMPLES.map((sample) => [sample.id, sample]),
);

const VISUAL_KEYS = new Set(Object.keys(art));
const ART_BY_KEY: Record<string, string> = art;

/**
 * Resolve a record's symbolic artwork. The art is place/object-based, never a
 * depiction of the Prophet ﷺ or of a companion, and the UI labels it as
 * symbolic rather than historical.
 */
export function resolveSeerahArtwork(visualKey: string): string {
  return ART_BY_KEY[visualKey] ?? art.desert;
}

const VALID_CERTAINTY = new Set<SeerahCertainty>([
  "established",
  "well_reported",
  "reported",
  "disputed",
]);

/** Arabic-aware normalization: diacritics, alef variants, taa marbuta, tatweel. */
export function normalizeSeerahSearch(value: string): string {
  return value
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ؤئ]/g, "ء")
    .trim()
    .toLowerCase();
}

export interface SeerahEventFilters {
  query?: string;
  eraId?: SeerahEraId | "all";
  personId?: string | "all";
  placeId?: string | "all";
  quranOnly?: boolean;
  hadithOnly?: boolean;
  certainty?: SeerahCertainty | "all";
}

export function eventMatchesQuery(event: SeerahEvent, query: string): boolean {
  const q = normalizeSeerahSearch(query);
  if (!q) return true;
  const place = event.placeId ? getSeerahPlace(event.placeId) : null;
  const haystack = normalizeSeerahSearch(
    [
      event.titleAr,
      event.titleEn,
      event.summaryAr,
      event.significanceAr,
      event.dateTextAr,
      ...event.tags,
      place?.nameAr ?? "",
      ...event.peopleIds.map((id) => getSeerahPerson(id)?.nameAr ?? ""),
    ].join(" "),
  );
  return haystack.includes(q);
}

export function filterSeerahEvents(filters: SeerahEventFilters = {}): SeerahEvent[] {
  const {
    query = "",
    eraId = "all",
    personId = "all",
    placeId = "all",
    quranOnly = false,
    hadithOnly = false,
    certainty = "all",
  } = filters;

  return SEERAH_EVENTS.filter((event) => {
    if (eraId !== "all" && event.eraId !== eraId) return false;
    if (personId !== "all" && !event.peopleIds.includes(personId)) return false;
    if (placeId !== "all" && event.placeId !== placeId) return false;
    if (quranOnly && event.quranRefs.length === 0) return false;
    if (hadithOnly && event.hadithRefs.length === 0) return false;
    if (certainty !== "all" && event.certainty !== certainty) return false;
    return eventMatchesQuery(event, query);
  });
}

export interface ResolvedQuranVerse {
  key: string;
  surah: number;
  ayah: number;
  text: string;
  href: string;
}

export function resolveQuranRef(ref: SeerahQuranRef): ResolvedQuranVerse[] {
  const verses: ResolvedQuranVerse[] = [];
  for (let ayah = ref.ayahStart; ayah <= ref.ayahEnd; ayah += 1) {
    const key = `${ref.surah}:${ayah}`;
    const text = UTHMANI_VERSES[key];
    if (!text) continue;
    verses.push({
      key,
      surah: ref.surah,
      ayah,
      text,
      href: `/quran?surah=${ref.surah}&ayah=${ayah}`,
    });
  }
  return verses;
}

export type ResolvedHadithRef =
  | {
      kind: "local_sample";
      noteAr: string;
      sample: HadithRecord;
      href: string;
      labelAr: string;
    }
  | {
      kind: "external_reference";
      noteAr: string;
      collectionId: string;
      collectionTitleAr: string;
      bookNameAr: string;
      chapterNameAr: string;
      href: string;
      labelAr: string;
      verification: "external_reference_only";
    };

export function resolveHadithRef(ref: SeerahHadithRef): ResolvedHadithRef | null {
  if (ref.kind === "local_sample") {
    const sample = LOCAL_SAMPLE_BY_ID.get(ref.sampleId);
    if (!sample) return null;
    return {
      kind: "local_sample",
      noteAr: ref.noteAr,
      sample,
      href: `/hadith?sample=${encodeURIComponent(sample.id)}`,
      labelAr: `${sample.bookNameAr} — ${sample.chapterNameAr}`,
    };
  }

  const source = getSeerahSource(ref.collectionId);
  if (!source) return null;
  return {
    kind: "external_reference",
    noteAr: ref.noteAr,
    collectionId: ref.collectionId,
    collectionTitleAr: source.titleAr,
    bookNameAr: ref.bookNameAr,
    chapterNameAr: ref.chapterNameAr,
    href: `/hadith?collection=${encodeURIComponent(ref.collectionId)}`,
    labelAr: `${ref.bookNameAr} — ${ref.chapterNameAr}`,
    verification: ref.verification,
  };
}

export interface HydratedSeerahEvent {
  event: SeerahEvent;
  era: SeerahEra | null;
  place: SeerahPlace | null;
  people: SeerahPerson[];
  sources: Array<{ source: SeerahSource; locusAr: string }>;
  quran: Array<{ ref: SeerahQuranRef; verses: ResolvedQuranVerse[] }>;
  hadith: ResolvedHadithRef[];
  chapterTitleAr: string;
  atlasHref: string | null;
  artHref: string;
}

const CHAPTER_TITLE_BY_ID = new Map(seerahChapters.map((chapter) => [chapter.id, chapter.title]));

export function hydrateSeerahEvent(event: SeerahEvent): HydratedSeerahEvent {
  const place = event.placeId ? getSeerahPlace(event.placeId) : null;
  return {
    event,
    era: getSeerahEra(event.eraId),
    place,
    people: event.peopleIds
      .map((id) => getSeerahPerson(id))
      .filter((person): person is SeerahPerson => Boolean(person)),
    sources: event.sources
      .map((citation) => {
        const source = getSeerahSource(citation.sourceId);
        return source ? { source, locusAr: citation.locusAr } : null;
      })
      .filter(
        (entry): entry is { source: SeerahSource; locusAr: string } => Boolean(entry),
      ),
    quran: event.quranRefs.map((ref) => ({ ref, verses: resolveQuranRef(ref) })),
    hadith: event.hadithRefs
      .map((ref) => resolveHadithRef(ref))
      .filter((ref): ref is ResolvedHadithRef => Boolean(ref)),
    chapterTitleAr: CHAPTER_TITLE_BY_ID.get(event.chapterId) ?? event.chapterId,
    atlasHref: place?.atlasName
      ? `/atlas?place=${encodeURIComponent(place.atlasName)}`
      : null,
    artHref: resolveSeerahArtwork(event.visualKey),
  };
}

export function hydrateSeerahEventById(eventId: string): HydratedSeerahEvent | null {
  const event = getSeerahEvent(eventId);
  return event ? hydrateSeerahEvent(event) : null;
}

export interface SeerahEraGroup {
  era: SeerahEra;
  events: SeerahEvent[];
}

export function groupEventsByEra(events: SeerahEvent[]): SeerahEraGroup[] {
  return SEERAH_DATABASE.eras
    .map((era) => ({
      era,
      events: events.filter((event) => event.eraId === era.id),
    }))
    .filter((group) => group.events.length > 0);
}

export function listSeerahPeopleForEvents(events: SeerahEvent[]): SeerahPerson[] {
  const ids = new Set(events.flatMap((event) => event.peopleIds));
  return SEERAH_DATABASE.people
    .filter((person) => ids.has(person.id))
    .sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
}

export function listSeerahPlacesForEvents(events: SeerahEvent[]): SeerahPlace[] {
  const ids = new Set(events.map((event) => event.placeId).filter(Boolean));
  return SEERAH_DATABASE.places
    .filter((place) => ids.has(place.id))
    .sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
}

export const SEERAH_DATABASE_STATS = {
  ...SEERAH_DATABASE_COUNTS,
  quranAyahs: SEERAH_DATABASE.events.reduce(
    (total, event) =>
      total +
      event.quranRefs.reduce(
        (sum, ref) => sum + (ref.ayahEnd - ref.ayahStart + 1),
        0,
      ),
    0,
  ),
  peopleLinked: SEERAH_DATABASE.people.filter((person) =>
    SEERAH_DATABASE.events.some((event) => event.peopleIds.includes(person.id)),
  ).length,
  placesLinked: SEERAH_DATABASE.places.filter((place) =>
    SEERAH_DATABASE.events.some((event) => event.placeId === place.id),
  ).length,
  sourcesCited: SEERAH_DATABASE.sources.filter((source) =>
    SEERAH_DATABASE.events.some((event) =>
      event.sources.some((citation) => citation.sourceId === source.id),
    ),
  ).length,
} as const;

/**
 * Fail-closed integrity audit. Tests assert this returns an empty array; the UI
 * can surface the same list without duplicating validation logic.
 */
export function auditSeerahDatabase(): SeerahIntegrityIssue[] {
  const issues: SeerahIntegrityIssue[] = [];
  const seenEventIds = new Set<string>();
  const seenPersonIds = new Set<string>();
  const seenPlaceIds = new Set<string>();
  const seenSourceIds = new Set<string>();
  const eraIds = new Set(SEERAH_DATABASE.eras.map((era) => era.id));
  const chapterIds = new Set(seerahChapters.map((chapter) => chapter.id));
  let previousOrder = 0;

  for (const event of SEERAH_DATABASE.events) {
    if (seenEventIds.has(event.id)) {
      issues.push({ kind: "duplicate-id", recordId: event.id, detail: "event id repeated" });
    }
    seenEventIds.add(event.id);

    if (!eraIds.has(event.eraId)) {
      issues.push({ kind: "unknown-era", recordId: event.id, detail: event.eraId });
    }
    if (!chapterIds.has(event.chapterId)) {
      issues.push({ kind: "unknown-chapter", recordId: event.id, detail: event.chapterId });
    }
    if (event.order <= previousOrder) {
      issues.push({
        kind: "order-not-monotonic",
        recordId: event.id,
        detail: `${event.order} after ${previousOrder}`,
      });
    }
    previousOrder = event.order;

    if (event.yearAH !== null && (!Number.isInteger(event.yearAH) || event.yearAH < 0)) {
      issues.push({ kind: "bad-year", recordId: event.id, detail: String(event.yearAH) });
    }
    if (event.yearCE !== null && (!Number.isInteger(event.yearCE) || event.yearCE < 500)) {
      issues.push({ kind: "bad-year", recordId: event.id, detail: String(event.yearCE) });
    }
    if (!event.summaryAr.trim()) {
      issues.push({ kind: "empty-summary", recordId: event.id, detail: "summaryAr" });
    }
    if (!VALID_CERTAINTY.has(event.certainty)) {
      issues.push({ kind: "bad-year", recordId: event.id, detail: `certainty ${event.certainty}` });
    }
    if (event.reviewStatus !== "pending_review") {
      issues.push({ kind: "unreviewed-record", recordId: event.id, detail: event.reviewStatus });
    }
    if (event.placeId && !getSeerahPlace(event.placeId)) {
      issues.push({ kind: "unknown-place", recordId: event.id, detail: event.placeId });
    }
    for (const personId of event.peopleIds) {
      if (!getSeerahPerson(personId)) {
        issues.push({ kind: "unknown-person", recordId: event.id, detail: personId });
      }
    }
    if (event.sources.length === 0) {
      issues.push({ kind: "empty-sources", recordId: event.id, detail: "no source citation" });
    }
    for (const citation of event.sources) {
      if (!getSeerahSource(citation.sourceId)) {
        issues.push({ kind: "unknown-source", recordId: event.id, detail: citation.sourceId });
      }
    }
    for (const ref of event.quranRefs) {
      if (ref.ayahStart < 1 || ref.ayahEnd < ref.ayahStart) {
        issues.push({ kind: "quran-ref-range", recordId: event.id, detail: `${ref.surah}:${ref.ayahStart}-${ref.ayahEnd}` });
        continue;
      }
      for (let ayah = ref.ayahStart; ayah <= ref.ayahEnd; ayah += 1) {
        if (!UTHMANI_VERSES[`${ref.surah}:${ayah}`]) {
          issues.push({
            kind: "quran-ref-missing",
            recordId: event.id,
            detail: `${ref.surah}:${ayah}`,
          });
        }
      }
    }
    for (const ref of event.hadithRefs) {
      if (ref.kind === "local_sample" && !LOCAL_SAMPLE_BY_ID.has(ref.sampleId)) {
        issues.push({
          kind: "unknown-local-hadith-sample",
          recordId: event.id,
          detail: ref.sampleId,
        });
      }
      if (ref.kind === "external_reference" && !getSeerahSource(ref.collectionId)) {
        issues.push({ kind: "unknown-source", recordId: event.id, detail: ref.collectionId });
      }
    }
    if (!VISUAL_KEYS.has(event.visualKey)) {
      issues.push({ kind: "unknown-visual-key", recordId: event.id, detail: event.visualKey });
    }
  }

  for (const person of SEERAH_DATABASE.people) {
    if (seenPersonIds.has(person.id)) {
      issues.push({ kind: "duplicate-id", recordId: person.id, detail: "person id repeated" });
    }
    seenPersonIds.add(person.id);
    for (const sourceId of person.sourceIds) {
      if (!getSeerahSource(sourceId)) {
        issues.push({ kind: "unknown-source", recordId: person.id, detail: sourceId });
      }
    }
  }

  for (const place of SEERAH_DATABASE.places) {
    if (seenPlaceIds.has(place.id)) {
      issues.push({ kind: "duplicate-id", recordId: place.id, detail: "place id repeated" });
    }
    seenPlaceIds.add(place.id);
  }

  for (const source of SEERAH_DATABASE.sources) {
    if (seenSourceIds.has(source.id)) {
      issues.push({ kind: "duplicate-id", recordId: source.id, detail: "source id repeated" });
    }
    seenSourceIds.add(source.id);
  }

  for (const era of SEERAH_DATABASE.eras) {
    if (!SEERAH_DATABASE.events.some((event) => event.eraId === era.id)) {
      issues.push({ kind: "missing-era-events", recordId: era.id, detail: "era has no events" });
    }
  }

  return issues;
}

export const SEERAH_DATABASE_GUARANTEES = {
  chronological: true,
  allQuranRefsResolve: true,
  allHadithSamplesResolve: true,
  failClosedReview: true,
  minimumEvents: 90,
  noteAr:
    "كل حدث مرتب زمنيًا، وكل إحالة قرآنية تُحل من نسخة تنزيل المحلية، وكل عينة حديثية محلية موجودة، وكل السجلات معلّقة للمراجعة.",
} as const;
