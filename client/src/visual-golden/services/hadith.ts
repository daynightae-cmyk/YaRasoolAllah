import {
  HADITH_COLLECTIONS,
  HADITH_DEVELOPMENT_SAMPLES,
  type HadithCollection,
  type HadithRecord,
} from "@/data/hadithData";
import { SEERAH_EVENTS } from "@/data/seerah";
import type { HadithCorpusStatus } from "@shared/hadith";
import { apiUrl } from "@/lib/api-origin";

export type { HadithCollection, HadithRecord };
export type { HadithCorpusStatus } from "@shared/hadith";

export const COLLECTIONS: HadithCollection[] = HADITH_COLLECTIONS;

export const LOCAL_SAMPLES: HadithRecord[] = HADITH_DEVELOPMENT_SAMPLES;

export const HADITH_COUNTS = {
  collections: HADITH_COLLECTIONS.length,
  localSamples: HADITH_DEVELOPMENT_SAMPLES.length,
};

export async function getHadithCorpusStatus(signal?: AbortSignal): Promise<HadithCorpusStatus> {
  const response = await fetch(apiUrl("/api/content/hadith/status"), { signal });
  const body = await response.json().catch(() => null) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(body?.message || `HTTP ${response.status}`);
  }
  if (!body) {
    throw new Error("استجابة حالة مزودي الحديث غير صالحة.");
  }
  return body as HadithCorpusStatus;
}

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
      sample.textEn.toLowerCase().includes(lowered) ||
      // Reference search: a bare number matches the recorded hadith number
      // or book number — real registry fields, never invented references.
      (/^\d+$/.test(q) && (sample.hadithNumber === Number(q) || sample.bookNumber === Number(q))),
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

export interface EstablishedSeerahLink {
  eventId: string;
  chapterId: string;
  titleAr: string;
  noteAr: string;
  href: string;
}

/**
 * Reverse cross-links: Seerah events whose recorded hadithRefs explicitly
 * cite this local sample. These are ESTABLISHED data relationships — the
 * link exists because the governed Seerah database records it, never
 * inferred from topic similarity or invented. Links target the Seerah
 * database record view, which resolves governed events by id directly.
 */
export function establishedSeerahLinks(sampleId: string): EstablishedSeerahLink[] {
  const links: EstablishedSeerahLink[] = [];
  for (const event of SEERAH_EVENTS) {
    for (const ref of event.hadithRefs) {
      if (ref.kind === "local_sample" && ref.sampleId === sampleId) {
        links.push({
          eventId: event.id,
          chapterId: event.chapterId,
          titleAr: event.titleAr,
          noteAr: ref.noteAr,
          href: `/seerah/database?event=${encodeURIComponent(event.id)}`,
        });
      }
    }
  }
  return links;
}
