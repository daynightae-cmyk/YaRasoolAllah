import {
  HADITH_COLLECTIONS,
  HADITH_DEVELOPMENT_SAMPLES,
  type HadithCollection,
  type HadithRecord,
} from "@/data/hadithData";

export type { HadithCollection, HadithRecord };

export const COLLECTIONS: HadithCollection[] = HADITH_COLLECTIONS;

export const LOCAL_SAMPLES: HadithRecord[] = HADITH_DEVELOPMENT_SAMPLES;

export const HADITH_COUNTS = {
  collections: HADITH_COLLECTIONS.length,
  localSamples: HADITH_DEVELOPMENT_SAMPLES.length,
};

export function getCollection(collectionId: string): HadithCollection | null {
  return COLLECTIONS.find((collection) => collection.id === collectionId) ?? null;
}

export function samplesForCollection(collectionId: string | "all"): HadithRecord[] {
  if (collectionId === "all") return LOCAL_SAMPLES;
  return LOCAL_SAMPLES.filter((sample) => sample.collectionId === collectionId);
}

export function searchSamples(query: string, collectionId: string | "all"): HadithRecord[] {
  const q = query.trim();
  const base = samplesForCollection(collectionId);
  if (!q) return base;
  const lowered = q.toLowerCase();
  return base.filter(
    (sample) =>
      sample.textAr.includes(q) ||
      sample.narratorAr.includes(q) ||
      sample.bookNameAr.includes(q) ||
      sample.chapterNameAr.includes(q) ||
      sample.textEn.toLowerCase().includes(lowered),
  );
}
