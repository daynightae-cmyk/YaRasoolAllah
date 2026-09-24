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

export { getChapterById, getRelatedChapters };
