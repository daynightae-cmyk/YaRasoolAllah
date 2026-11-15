import {
  getChapterById,
  getRelatedChapters,
  seerahCategories,
  seerahChapters,
  type SeerahChapter,
} from "@/data/seerahData";

export type { SeerahChapter };

export const CHAPTERS: SeerahChapter[] = [...seerahChapters].sort((a, b) => a.order - b.order);

export const CATEGORIES = seerahCategories;

export const SEERAH_COUNTS = {
  chapters: seerahChapters.length,
  categories: seerahCategories.length,
  timelineEvents: seerahChapters.reduce((sum, chapter) => sum + (chapter.timelineEvents?.length ?? 0), 0),
};

export const DEFAULT_SEERAH_CHAPTER_ID = CHAPTERS[3]?.id ?? CHAPTERS[0]?.id ?? "";

/**
 * The current chapter/event records are local editorial structure, not a
 * governed scholarly source or edition. Keep that boundary explicit until
 * real source, edition, and version identifiers are attached to the data.
 */
export const SEERAH_CONTENT_STATUS = {
  materialKind: "local-editorial-structure",
  scholarlyReview: "pending",
  editionReview: "pending",
  governedSourceId: null,
  governedEditionId: null,
  governedVersionId: null,
  noticeAr:
    "مادة تحريرية محلية تنظّم الفصول والمحطات؛ المراجعة العلمية ومراجعة الطبعة قيد الانتظار، ولا تحمل هذه المادة معرّف مصدر أو طبعة معتمدًا.",
  noticeEn:
    "Local editorial structure for chapters and events; scholarly and edition review pending. No governed source or edition identifier is attached.",
} as const;

export interface SeerahSelection {
  chapterId: string;
  eventId: string;
}

export interface SeerahSelectionChapter {
  readonly id: string;
  readonly timelineEvents?: readonly { readonly id: string }[];
}

function firstEventId(chapter: SeerahSelectionChapter | undefined): string {
  return chapter?.timelineEvents?.[0]?.id ?? "";
}

/**
 * Resolve a URL selection without allowing an event to escape its chapter.
 * A chapter-only request leaves the event unselected so the detail view and
 * canonical URL describe the same item.
 */
export function resolveSeerahSelection(
  chapters: readonly SeerahSelectionChapter[],
  search: string,
  fallbackChapterId = DEFAULT_SEERAH_CHAPTER_ID,
): SeerahSelection {
  const params = new URLSearchParams(search);
  const requestedChapterId = params.get("chapter")?.trim() ?? "";
  const requestedEventId = params.get("event")?.trim() ?? "";
  const fallback =
    chapters.find((chapter) => chapter.id === fallbackChapterId) ?? chapters[0] ?? null;

  if (!fallback) return { chapterId: "", eventId: "" };

  if (!requestedChapterId && !requestedEventId) {
    return { chapterId: fallback.id, eventId: firstEventId(fallback) };
  }

  if (requestedChapterId) {
    const chapter = chapters.find((item) => item.id === requestedChapterId);
    if (!chapter) return { chapterId: fallback.id, eventId: "" };

    if (!requestedEventId) {
      return { chapterId: chapter.id, eventId: "" };
    }

    const event = chapter.timelineEvents?.find((item) => item.id === requestedEventId);
    return { chapterId: chapter.id, eventId: event?.id ?? "" };
  }

  const owners = chapters.filter((chapter) =>
    chapter.timelineEvents?.some((event) => event.id === requestedEventId),
  );
  if (owners.length === 1) {
    return { chapterId: owners[0]!.id, eventId: requestedEventId };
  }

  return { chapterId: fallback.id, eventId: "" };
}

/** Select a chapter without borrowing or implicitly choosing an event. */
export function chooseSeerahChapter(
  chapters: readonly SeerahSelectionChapter[],
  chapterId: string,
): SeerahSelection {
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) return { chapterId: "", eventId: "" };
  return { chapterId: chapter.id, eventId: "" };
}

/** Select an event only when that event belongs to the requested chapter. */
export function chooseSeerahEvent(
  chapters: readonly SeerahSelectionChapter[],
  chapterId: string,
  eventId: string,
): SeerahSelection {
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) return { chapterId: "", eventId: "" };
  const event = chapter.timelineEvents?.find((item) => item.id === eventId);
  return { chapterId: chapter.id, eventId: event?.id ?? "" };
}

/** Build a canonical query while preserving unrelated query parameters. */
export function buildSeerahSelectionSearch(
  currentSearch: string,
  selection: SeerahSelection,
): string {
  const remaining = new URLSearchParams(currentSearch);
  remaining.delete("chapter");
  remaining.delete("event");

  const managed = new URLSearchParams();
  if (selection.chapterId) {
    managed.set("chapter", selection.chapterId);
    if (selection.eventId) managed.set("event", selection.eventId);
  }
  remaining.forEach((value, key) => managed.append(key, value));

  const query = managed.toString();
  return query ? `?${query}` : "";
}

/** Build an app-relative URL whose event query is always chapter-scoped. */
export function buildSeerahSelectionUrl(
  currentUrl: string,
  selection: SeerahSelection,
): string {
  const url = new URL(currentUrl, "https://seerah.local");
  url.search = buildSeerahSelectionSearch(url.search, selection);
  return `${url.pathname}${url.search}${url.hash}`;
}

export { getChapterById, getRelatedChapters };
