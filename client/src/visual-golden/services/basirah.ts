import { HADITH_COLLECTIONS, HADITH_DEVELOPMENT_SAMPLES } from "@/data/hadithData";
import { seerahChapters } from "@/data/seerahData";
import type { QuranChapter } from "@/services/quranService";
import { digitalVersionRegistry, workRegistry } from "@shared/knowledge-registry";
import { sourceRegistry } from "@shared/source-registry";

export type BasirahScope = "all" | "quran" | "hadith" | "seerah" | "library" | "sources";
export type BasirahMode = "sourced" | "simple" | "compare" | "evidence" | "explore";

export interface BasirahRecord {
  id: string;
  scope: Exclude<BasirahScope, "all">;
  titleAr: string;
  titleEn: string;
  kindAr: string;
  kindEn: string;
  path: string;
  hintAr: string;
  hintEn: string;
  availabilityAr: string;
}

export const BASIRAH_SCOPES: { id: BasirahScope; ar: string; en: string }[] = [
  { id: "all", ar: "الكل", en: "All" },
  { id: "quran", ar: "القرآن الكريم", en: "Qur’an" },
  { id: "hadith", ar: "الحديث والسنة", en: "Hadith & Sunnah" },
  { id: "seerah", ar: "السيرة النبوية", en: "Seerah" },
  { id: "library", ar: "المكتبة", en: "Library" },
  { id: "sources", ar: "المصادر", en: "Sources" },
];

export const BASIRAH_MODES: { id: BasirahMode; ar: string; en: string }[] = [
  { id: "sourced", ar: "بحث موثّق", en: "Sourced search" },
  { id: "simple", ar: "شرح مبسط", en: "Plain explanation" },
  { id: "compare", ar: "مقارنة المصادر", en: "Compare sources" },
  { id: "evidence", ar: "تتبع الدليل", en: "Follow the evidence" },
  { id: "explore", ar: "استكشاف الموضوع", en: "Explore a topic" },
];

function collectionName(collectionId: string): string {
  return HADITH_COLLECTIONS.find((c) => c.id === collectionId)?.nameAr ?? collectionId;
}

/** Local source-discovery index. Every record names its source, path, and availability. */
export function buildLocalIndex(): BasirahRecord[] {
  const records: BasirahRecord[] = [];

  for (const chapter of [...seerahChapters].sort((a, b) => a.order - b.order)) {
    records.push({
      id: `seerah-${chapter.id}`,
      scope: "seerah",
      titleAr: chapter.title,
      titleEn: `Seerah chapter ${chapter.order}`,
      kindAr: "فصل سيرة",
      kindEn: "seerah chapter",
      path: "/seerah",
      hintAr: chapter.description.slice(0, 90),
      hintEn: `${chapter.timelineEvents?.length ?? 0} recorded events`,
      availabilityAr: "متن الفصل معروض من المصدر المعتمد",
    });
  }

  for (const sample of HADITH_DEVELOPMENT_SAMPLES) {
    records.push({
      id: `hadith-${sample.id}`,
      scope: "hadith",
      titleAr: `${collectionName(sample.collectionId)} · حديث ${sample.hadithNumber}`,
      titleEn: `${sample.collectionId} ${sample.hadithNumber}`,
      kindAr: "سجل حديث محلي",
      kindEn: "local hadith record",
      path: "/hadith",
      hintAr: `${sample.bookNameAr} · ${sample.chapterNameAr}`,
      hintEn: `Narrator: ${sample.narratorEn ?? sample.narratorAr}`,
      availabilityAr: "عينة تطوير قيد المراجعة التحريرية",
    });
  }

  for (const work of workRegistry) {
    const versions = digitalVersionRegistry.filter((v) => v.workId === work.workId).length;
    records.push({
      id: `work-${work.workId}`,
      scope: "library",
      titleAr: work.titleAr,
      titleEn: work.titleEn,
      kindAr: "سجل عمل",
      kindEn: "work record",
      path: "/library",
      hintAr: `${work.authorAr} · ${versions} نسخة فهرسية`,
      hintEn: work.openitiWorkUri ?? "no OpenITI version pinned",
      availabilityAr: "سجل فهرسي فقط — النص الكامل غير متاح",
    });
  }

  for (const source of sourceRegistry) {
    records.push({
      id: `source-${source.sourceId}`,
      scope: "sources",
      titleAr: source.title,
      titleEn: source.provider,
      kindAr: "مصدر موثق",
      kindEn: "source",
      path: "/sources",
      hintAr: source.notes.slice(0, 90),
      hintEn: source.editorialStatus,
      availabilityAr:
        source.editorialStatus === "verified" ? "موثق" : "قيد المراجعة",
    });
  }

  return records;
}

export function surahRecords(chapters: QuranChapter[]): BasirahRecord[] {
  return chapters.map((chapter) => ({
    id: `quran-surah-${chapter.number}`,
    scope: "quran" as const,
    titleAr: `سورة ${chapter.arabicName}`,
    titleEn: chapter.englishName,
    kindAr: "سورة",
    kindEn: "surah",
    path: "/quran",
    hintAr: `${chapter.ayahCount} آية · ${chapter.revelationType === "meccan" ? "مكية" : "مدنية"}`,
    hintEn: `${chapter.ayahCount} verses`,
    availabilityAr: "النص العربي من Tanzil Uthmani-min 1.1",
  }));
}

export function searchBasirah(records: BasirahRecord[], query: string, scope: BasirahScope): BasirahRecord[] {
  const n = query.trim();
  return records.filter((record) => {
    if (scope !== "all" && record.scope !== scope) return false;
    if (!n) return true;
    const hay = `${record.titleAr} ${record.titleEn} ${record.hintAr} ${record.hintEn} ${record.kindAr}`;
    return hay.toLowerCase().includes(n.toLowerCase()) || hay.includes(n);
  });
}

export const BASIRAH_COUNTS = {
  seerah: seerahChapters.length,
  hadithSamples: HADITH_DEVELOPMENT_SAMPLES.length,
  works: workRegistry.length,
  sources: sourceRegistry.length,
};
