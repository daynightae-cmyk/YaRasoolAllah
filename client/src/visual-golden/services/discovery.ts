import { HADITH_DEVELOPMENT_SAMPLES } from "@/data/hadithData";
import { seerahChapters } from "@/data/seerahData";
import { digitalVersionRegistry, workRegistry } from "@shared/knowledge-registry";
import { buildLocalIndex, searchBasirah, type BasirahRecord, type BasirahScope } from "./basirah";

/**
 * Canonical discovery adapter for the golden shell. Wing navigation,
 * registry-derived facts, and the shared local-search index live here so the
 * hero search, the discovery palette, and Basirah do not maintain competing
 * truth engines. The legacy GlobalSearchDialog keeps its own richer index for
 * now; new surfaces should build on this module.
 */
export type WingPath =
  | "/"
  | "/library"
  | "/quran"
  | "/tafsir"
  | "/hadith"
  | "/atlas"
  | "/kids"
  | "/daily"
  | "/audio"
  | "/seerah"
  | "/basirah"
  | "/sources";

export const discoveryWings: {
  path: WingPath;
  ar: string;
  en: string;
  hint: string;
}[] = [
  { path: "/", ar: "بوابة النور", en: "Gateway of Light", hint: "المدخل الرئيسي" },
  { path: "/quran", ar: "القرآن الكريم", en: "The Holy Qur’an", hint: "مصحف القراءة — 114 سورة موثقة" },
  { path: "/tafsir", ar: "التفسير والتدبر", en: "Tafsir & Tadabbur", hint: "فهرس مصنفات التفسير" },
  { path: "/hadith", ar: "الحديث والسنة", en: "Hadith & Sunnah", hint: "مصنفات ببليوغرافية وسجلات محلية" },
  { path: "/library", ar: "المكتبة الرقمية", en: "Digital Library", hint: "سجلات الأعمال والنسخ" },
  { path: "/seerah", ar: "السيرة النبوية", en: "Prophetic Biography", hint: "فصول سردية من المصدر المعتمد" },
  { path: "/atlas", ar: "الأطلس التخطيطي", en: "Schematic Atlas", hint: "مواضع تخطيطية — ليست إحداثيات" },
  { path: "/kids", ar: "الأطفال والعائلة", en: "Kids & Family", hint: "تكييفات تعليمية ووضع قراءة" },
  { path: "/daily", ar: "مرصد الصلاة", en: "Prayer Observatory", hint: "مواقيت حية حسب المدينة والقبلة" },
  { path: "/audio", ar: "التلاوات الصوتية", en: "Qur’an Audio", hint: "سجل المزوّدين — التشغيل غير مُجاز" },
  { path: "/basirah", ar: "بصيرة", en: "Basirah", hint: "اكتشاف المصادر المحلية" },
  { path: "/sources", ar: "خزانة المصادر", en: "Sources Vault", hint: "المصادر والحقوق والمزوّدون والنسخ" },
];

export function filterWings(query: string) {
  const n = query.trim();
  if (!n) return discoveryWings;
  return discoveryWings.filter(
    (w) => w.ar.includes(n) || w.en.toLowerCase().includes(n.toLowerCase()) || w.hint.includes(n),
  );
}

import type { QuranChapter } from "@/services/quranService";

/** Registry-derived facts. Surah/ayah totals always derive from chapter metadata. */
export function discoveryFacts(chapters: QuranChapter[]) {
  return {
    surahs: chapters.length,
    ayahs: chapters.reduce((sum, chapter) => sum + chapter.ayahCount, 0),
    works: workRegistry.length,
    versions: digitalVersionRegistry.length,
    seerahChapters: seerahChapters.length,
    hadithSamples: HADITH_DEVELOPMENT_SAMPLES.length,
  };
}

export type { BasirahRecord, BasirahScope };
export { buildLocalIndex, searchBasirah };
