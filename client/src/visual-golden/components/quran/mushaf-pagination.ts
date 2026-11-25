export interface MushafVerseLike {
  ayah: number;
  arabic: string;
}

export interface MushafReadingPage<T extends MushafVerseLike> {
  verses: T[];
  firstAyah: number;
  lastAyah: number;
}

/**
 * Readable, surah-local pagination only. This deliberately does not claim the
 * pagination of a printed Madani Mushaf. Verses are kept verbatim and in their
 * original order; long ayahs receive a page of their own instead of truncation.
 */
export function buildMushafReadingPages<T extends MushafVerseLike>(
  verses: readonly T[],
  weightBudget = 360,
  maxVersesPerPage = 5,
): MushafReadingPage<T>[] {
  const pages: MushafReadingPage<T>[] = [];
  let current: T[] = [];
  let weight = 0;

  for (const verse of verses) {
    const verseWeight = Math.max(54, verse.arabic.length + 34);
    if (current.length > 0 && (weight + verseWeight > weightBudget || current.length >= maxVersesPerPage)) {
      pages.push({
        verses: current,
        firstAyah: current[0].ayah,
        lastAyah: current[current.length - 1].ayah,
      });
      current = [];
      weight = 0;
    }
    current.push(verse);
    weight += verseWeight;
  }

  if (current.length > 0) {
    pages.push({
      verses: current,
      firstAyah: current[0].ayah,
      lastAyah: current[current.length - 1].ayah,
    });
  }
  return pages;
}

export function spreadForAyah<T extends MushafVerseLike>(
  pages: readonly MushafReadingPage<T>[],
  ayah: number,
): number {
  const pageIndex = pages.findIndex((page) => page.verses.some((verse) => verse.ayah === ayah));
  return Math.max(0, Math.floor(Math.max(0, pageIndex) / 2));
}
