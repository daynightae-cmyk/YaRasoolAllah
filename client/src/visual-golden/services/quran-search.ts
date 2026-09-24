import { getQuranChapterVerses, getQuranChapters } from "@/services/quranService";

export interface QuranSearchHit {
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
}

let verifiedIndexPromise: Promise<QuranSearchHit[]> | null = null;

/**
 * Search-only normalization. The canonical Tanzil display text is never
 * modified or persisted in normalized form.
 */
export function normalizeArabicForSearch(input: string): string {
  return input
    .normalize("NFC")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}

async function getVerifiedIndex(): Promise<QuranSearchHit[]> {
  if (!verifiedIndexPromise) {
    verifiedIndexPromise = (async () => {
      const chapters = await getQuranChapters();
      const chapterVerses = await Promise.all(
        chapters.map(async (chapter) => {
          const verses = await getQuranChapterVerses(chapter.number);
          return verses.map((verse) => ({
            surah: verse.surah,
            ayah: verse.ayah,
            surahName: chapter.arabicName,
            arabic: verse.arabic,
          }));
        }),
      );
      return chapterVerses.flat();
    })();
  }
  return verifiedIndexPromise;
}

export async function searchVerifiedQuran(
  query: string,
  limit = 30,
): Promise<QuranSearchHit[]> {
  const needle = normalizeArabicForSearch(query);
  if (needle.length < 2) return [];

  const index = await getVerifiedIndex();
  const results: QuranSearchHit[] = [];

  for (const record of index) {
    if (normalizeArabicForSearch(record.arabic).includes(needle)) {
      results.push(record);
      if (results.length >= Math.max(1, Math.min(limit, 50))) break;
    }
  }

  return results;
}
