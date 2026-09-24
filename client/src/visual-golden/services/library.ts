import { art } from "@/visual-golden/mock/art";
import {
  digitalVersionRegistry,
  workRegistry,
  type ContentAvailability,
  type DigitalVersionRecord,
  type ReviewState,
  type WorkCategory,
  type WorkRecord,
} from "@shared/knowledge-registry";

export type BookMode = "عرض" | "قراءة" | "استماع";

export interface LibraryBook {
  id: string;
  title: string;
  titleEn: string;
  author: string;
  authorEn: string;
  shelf: string;
  category: WorkCategory;
  workId: string;
  openitiWorkUri: string | null;
  versionCount: number;
  versions: DigitalVersionRecord[];
  contentAvailability: ContentAvailability;
  rightsState: string;
  bibliographicStatus: ReviewState;
  scholarlyReviewStatus: ReviewState;
  attributionCaveat: string;
  sourceIds: string[];
  tag: string;
  modes: BookMode[];
  cover: string;
  spine: {
    color: string;
    gilt: string;
    height: number;
    width: number;
  };
}

export const CATEGORY_SHELF: Record<WorkCategory, string> = {
  seerah: "السيرة النبوية",
  history: "التاريخ",
  tafsir: "التفسير وعلوم القرآن",
  hadith: "الحديث الشريف",
  adab: "الآداب والأخلاق",
};

export const shelves: string[] = [
  CATEGORY_SHELF.seerah,
  CATEGORY_SHELF.history,
  CATEGORY_SHELF.tafsir,
  CATEGORY_SHELF.hadith,
  CATEGORY_SHELF.adab,
];

const SPINE_PALETTE: Array<{ color: string; gilt: string }> = [
  { color: "#16382f", gilt: "#e8c547" },
  { color: "#3d2414", gilt: "#f0d78c" },
  { color: "#1a2744", gilt: "#e8c547" },
  { color: "#4a1c28", gilt: "#f5e6b8" },
  { color: "#0f2f28", gilt: "#e8c547" },
  { color: "#1c3d32", gilt: "#f5e6b8" },
  { color: "#14261f", gilt: "#f0d78c" },
  { color: "#3b2210", gilt: "#f5e6b8" },
];

const COVER_BY_CATEGORY: Record<WorkCategory, string> = {
  seerah: art.bookStack,
  history: art.books,
  tafsir: art.mushafOpen,
  hadith: art.mushaf,
  adab: art.lanternGlow,
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function spineFor(workId: string) {
  const hash = hashString(workId);
  const palette = SPINE_PALETTE[hash % SPINE_PALETTE.length];
  return {
    color: palette.color,
    gilt: palette.gilt,
    height: 150 + (hash % 45),
    width: 24 + (hash % 15),
  };
}

function tagFor(record: WorkRecord): string {
  if (record.bibliographicStatus === "verified_bibliographic") return "فهرس موثق";
  return "قيد المراجعة";
}

function toLibraryBook(record: WorkRecord): LibraryBook {
  const versions = digitalVersionRegistry.filter((version) => version.workId === record.workId);
  // All registered versions are currently catalog_only: no cleared in-app
  // reading or listening exists. Only the catalog desk ("عرض") is enabled.
  const modes: BookMode[] = ["عرض"];
  return {
    id: record.workId,
    title: record.titleAr,
    titleEn: record.titleEn,
    author: record.authorAr,
    authorEn: record.authorEn,
    shelf: CATEGORY_SHELF[record.category],
    category: record.category,
    workId: record.workId,
    openitiWorkUri: record.openitiWorkUri,
    versionCount: versions.length,
    versions,
    contentAvailability: "catalog_only",
    rightsState: "catalog_metadata_only_full_text_needs_version_review",
    bibliographicStatus: record.bibliographicStatus,
    scholarlyReviewStatus: record.scholarlyReviewStatus,
    attributionCaveat: record.attributionCaveat,
    sourceIds: record.sourceIds,
    tag: tagFor(record),
    modes,
    cover: COVER_BY_CATEGORY[record.category] ?? art.books,
    spine: spineFor(record.workId),
  };
}

export const catalog: LibraryBook[] = workRegistry.map(toLibraryBook);

export function getLibraryBook(workId: string): LibraryBook | null {
  return catalog.find((book) => book.workId === workId) ?? null;
}

export function searchLibrary(query: string, activeShelf: string | "الكل"): LibraryBook[] {
  const q = query.trim();
  return catalog.filter((book) => {
    const shelfHit = activeShelf === "الكل" || book.shelf === activeShelf;
    if (!shelfHit) return false;
    if (!q) return true;
    return (
      book.title.includes(q) ||
      book.author.includes(q) ||
      book.titleEn.toLowerCase().includes(q.toLowerCase()) ||
      book.shelf.includes(q)
    );
  });
}

export const LIBRARY_COUNTS = {
  works: workRegistry.length,
  versions: digitalVersionRegistry.length,
};
