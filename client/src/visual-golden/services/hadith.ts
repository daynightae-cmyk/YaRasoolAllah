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

/**
 * Build an honest share text for a development sample. The text always
 * labels the record as a development sample under editorial review and
 * never claims verification, full-corpus membership, or a complete isnad.
 */
export function buildHadithShareText(sample: HadithRecord, collectionNameAr: string): string {
  const lines = [
    `عينة تطويرية — ${collectionNameAr} · حديث رقم ${sample.hadithNumber}`,
    `${sample.bookNameAr} · ${sample.chapterNameAr}`,
    "",
    sample.textAr,
    "",
    `الراوي المسجل: ${sample.narratorAr} (السلسلة الكاملة غير متوفرة كبنية بيانات)`,
    `الدرجة: ${sample.gradeAr} · المصدر: ${sample.gradeSource} · المقيّم: ${sample.gradeAssessor ?? "غير مذكور في السجل"}`,
    `المراجعة التحريرية: ${sample.editorialReviewStatus}`,
    `المنشأ: ${sample.provenance}`,
    "هذه عينة تطوير محلية قيد المراجعة — ليست متنًا إنتاجيًا ولا تغني عن مراجعة المصدر.",
  ];
  return lines.join("\n");
}

/**
 * Build a relative deep link that reopens the same development sample.
 * Only identifiers from the governed local registry are accepted; unknown
 * ids produce the plain archive path so the UI never invents a record.
 */
export function buildHadithDeepLink(sampleId: string, collectionId: string): string {
  const known = LOCAL_SAMPLES.some((sample) => sample.id === sampleId);
  if (!known) return "/hadith";
  const params = new URLSearchParams({ sample: sampleId });
  if (collectionId !== "all" && COLLECTIONS.some((collection) => collection.id === collectionId)) {
    params.set("collection", collectionId);
  }
  return `/hadith?${params.toString()}`;
}
