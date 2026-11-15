import { azkarData } from "@/data/azkarData";
import { childrenAdaptationRegistry } from "@shared/knowledge-registry";
import {
  buildLocalIndex,
  type BasirahRecord,
} from "@/visual-golden/services/basirah";
import { discoveryWings } from "@/visual-golden/services/discovery";

export type SearchResultCategory =
  | "quran"
  | "hadith"
  | "seerah_event"
  | "person"
  | "place"
  | "book"
  | "kids"
  | "daily_guidance"
  | "wing"
  | "source_record"
  | "basirah";

export interface UnifiedSearchResult {
  id: string;
  category: SearchResultCategory;
  categoryLabelAr: string;
  title: string;
  excerpt: string;
  path: string;
  sourceIdentifier?: string;
  provenance: string;
}

export interface SearchCategoryTab {
  id: "all" | SearchResultCategory;
  label: string;
}

export const GLOBAL_SEARCH_CATEGORY_TABS: readonly SearchCategoryTab[] = [
  { id: "all", label: "الكل" },
  { id: "quran", label: "القرآن الكريم" },
  { id: "basirah", label: "بصيرة البحث" },
  { id: "seerah_event", label: "السيرة النبوية" },
  { id: "book", label: "المكتبة والكتب" },
  { id: "hadith", label: "الحديث والسنة" },
  { id: "source_record", label: "المصادر" },
  { id: "daily_guidance", label: "الأذكار والهدي" },
  { id: "kids", label: "ركن الطفل" },
  { id: "wing", label: "الأروقة" },
];

const MAX_QUERY_LENGTH = 120;

function canonicalCategory(record: BasirahRecord): SearchResultCategory {
  switch (record.scope) {
    case "library":
      return "book";
    case "hadith":
      return "hadith";
    case "sources":
      return "source_record";
    case "seerah":
      return "seerah_event";
    case "quran":
      return "quran";
  }
}

function canonicalCategoryLabel(record: BasirahRecord): string {
  switch (record.scope) {
    case "library":
      return "سجل ببليوغرافي";
    case "hadith":
      return "سجل حديث محلي";
    case "sources":
      return "سجل مصدر";
    case "seerah":
      return "فصل سيرة محلي";
    case "quran":
      return "سجل قرآني محلي";
  }
}

/**
 * Compatibility index for the pre-existing route shell. The canonical Basirah
 * records remain the source of truth for entity identity, path, availability,
 * and review state; this adapter only translates their fields for the legacy
 * dialog presentation.
 */
export function buildGlobalSearchIndex(): UnifiedSearchResult[] {
  const items: UnifiedSearchResult[] = [];

  for (const record of buildLocalIndex()) {
    items.push({
      id: `canonical:${record.scope}:${record.id}`,
      category: canonicalCategory(record),
      categoryLabelAr: canonicalCategoryLabel(record),
      title: record.titleAr,
      excerpt: `${record.hintAr} — ${record.availabilityAr}`,
      path: record.path,
      sourceIdentifier: record.sourceIds[0] ?? record.id,
      provenance: record.certaintyReasonAr,
    });
  }

  // Platform-original educational adaptations remain explicitly labelled as
  // adaptations rather than direct Qur'an or Hadith quotations.
  for (const adaptation of childrenAdaptationRegistry) {
    items.push({
      id: `kids:${adaptation.adaptationId}`,
      category: "kids",
      categoryLabelAr: "مادة تعليمية أصلية",
      title: adaptation.titleAr,
      excerpt: adaptation.summaryAr,
      path: "/kids",
      sourceIdentifier: `الفئة ${adaptation.ageBand}`,
      provenance: `تكييف أصلي للمنصة — ${adaptation.editorialStatus}، والمراجعة العلمية معلقة`,
    });
  }

  for (const azkar of azkarData) {
    items.push({
      id: `azkar:${azkar.id}`,
      category: "daily_guidance",
      categoryLabelAr: "ذكر وهدي محلي",
      title: azkar.title || "ذكر ودعاء",
      excerpt: azkar.content?.slice(0, 120) || azkar.description || "",
      path: "/daily",
      sourceIdentifier: azkar.reference,
      provenance: azkar.reference
        ? `سجل أذكار محلي — المرجع المقيد: ${azkar.reference}`
        : "سجل أذكار محلي — المراجعة العلمية غير مثبتة في هذا السجل",
    });
  }

  for (const wing of discoveryWings) {
    items.push({
      id: `wing:${wing.path}`,
      category: "wing",
      categoryLabelAr: "أروقة الصرح",
      title: wing.ar,
      excerpt: wing.hint,
      path: wing.path,
      provenance: "تنقل مؤسسي محلي",
    });
  }

  return items;
}

/**
 * Query actions are the hand-off to the two canonical search surfaces. They
 * are records of intent, not claims that a result or approval already exists.
 */
export function buildGlobalSearchQueryActions(query: string): UnifiedSearchResult[] {
  const normalized = query.trim().slice(0, MAX_QUERY_LENGTH);
  if (!normalized) return [];

  const encoded = encodeURIComponent(normalized);
  return [
    {
      id: "action:quran-search",
      category: "quran",
      categoryLabelAr: "بحث في المصحف",
      title: `البحث في القرآن عن «${normalized}»`,
      excerpt: "يفتح البحث في النص العربي المحلي الموثق",
      path: `/quran?q=${encoded}`,
      provenance: "إجراء بحث محلي — تُعرض النتائج من النص القرآني المحفوظ حرفيًا فقط",
    },
    {
      id: "action:basirah-search",
      category: "basirah",
      categoryLabelAr: "بحث موثق في بصيرة",
      title: `متابعة البحث الموثق عن «${normalized}»`,
      excerpt: "يفتح مكتب بصيرة لربط النتائج بحالة المراجعة المعلنة",
      path: `/basirah?q=${encoded}`,
      provenance: "إجراء بحث موثق — النتائج مرتبطة بمعرفات وحالات مراجعة معلنة",
    },
  ];
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("ar")
    .trim();
}

export function filterGlobalSearchResults(
  items: readonly UnifiedSearchResult[],
  query: string,
  category: "all" | SearchResultCategory,
): UnifiedSearchResult[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const actions = buildGlobalSearchQueryActions(normalized).filter(
    (item) => category === "all" || item.category === category,
  );
  const records = items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    const haystack = normalizeSearchText(
      [item.title, item.excerpt, item.sourceIdentifier ?? ""].join(" "),
    );
    return haystack.includes(normalized);
  });

  return [...actions, ...records];
}
