export type LibraryUiLanguage = "ar" | "en";

export interface CatalogDigitalEvidence {
  format: string;
  rights: string;
  reading: string;
  itemUrl: string | null;
  fileUrl: string | null;
  iiifUrl: string | null;
  ocrAvailable: boolean;
  searchableText: boolean;
}

export type AvailabilityState =
  | "full_text"
  | "pdf"
  | "external_reader"
  | "iiif"
  | "ocr"
  | "metadata_only"
  | "rights_review"
  | "digital_unavailable";

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  "A-القرآن وعلومه": { ar: "القرآن وعلومه", en: "Qur'an and Qur'anic studies" },
  "B-التفسير": { ar: "التفسير", en: "Qur'anic exegesis" },
  "C-الحديث النبوي": { ar: "الحديث النبوي", en: "Hadith" },
  "D-السيرة النبوية": { ar: "السيرة النبوية", en: "Prophetic biography" },
  "E-الصحابة": { ar: "الصحابة رضي الله عنهم", en: "Companions" },
  "E-الصحابة رضي الله عنهم": { ar: "الصحابة رضي الله عنهم", en: "Companions" },
  "F-أمهات المؤمنين وأهل البيت": { ar: "أمهات المؤمنين وأهل البيت", en: "Mothers of the Believers and Ahl al-Bayt" },
  "G-التابعون وتابعو التابعين": { ar: "التابعون وتابعو التابعين", en: "Successors and their followers" },
  "H-التراجم والطبقات": { ar: "التراجم والطبقات", en: "Biography and biographical dictionaries" },
  "I-العقيدة": { ar: "العقيدة", en: "Creed" },
  "J-الفقه": { ar: "الفقه", en: "Jurisprudence" },
  "K-أصول الفقه والقواعد": { ar: "أصول الفقه والقواعد", en: "Legal theory and maxims" },
  "L-الفتاوى": { ar: "الفتاوى", en: "Legal opinions" },
  "M-الزهد والرقائق والأخلاق": { ar: "الزهد والرقائق والأخلاق", en: "Ethics and spiritual refinement" },
  "N-التاريخ الإسلامي": { ar: "التاريخ الإسلامي", en: "Islamic history" },
  "O-الجغرافيا والرحلات": { ar: "الجغرافيا والرحلات", en: "Geography and travel" },
  "P-اللغة العربية": { ar: "اللغة والأدب", en: "Arabic language and literature" },
  "R-المرأة والأسرة": { ar: "المرأة والأسرة", en: "Women and family" },
  "S-الطفل": { ar: "الطفل والتربية", en: "Children and education" },
  "T-الموسوعات والفهارس": { ar: "الموسوعات والفهارس", en: "Encyclopedias and indexes" },
};

const AVAILABILITY_LABELS: Record<AvailabilityState, { ar: string; en: string }> = {
  full_text: { ar: "نص كامل متاح", en: "Full text available" },
  pdf: { ar: "PDF متاح", en: "PDF available" },
  external_reader: { ar: "قارئ خارجي", en: "External reader" },
  iiif: { ar: "IIIF متاح", en: "IIIF available" },
  ocr: { ar: "OCR متاح", en: "OCR available" },
  metadata_only: { ar: "بيانات فهرسية فقط", en: "Catalog metadata only" },
  rights_review: { ar: "حقوق الوصول قيد المراجعة", en: "Access rights under review" },
  digital_unavailable: { ar: "نسخة رقمية غير متاحة", en: "Digital version unavailable" },
};

const RIGHTS_LABELS: Record<string, { ar: string; en: string }> = {
  CLEARED_WITH_ATTRIBUTION: { ar: "متاح مع وجوب النسبة إلى المصدر", en: "Cleared with attribution" },
  PUBLIC_DOMAIN: { ar: "ملك عام مثبت", en: "Confirmed public domain" },
  OPEN_LICENSE: { ar: "ترخيص مفتوح", en: "Open licence" },
  PROVIDER_ALLOWS_ACCESS: { ar: "المصدر يتيح الوصول", en: "Provider allows access" },
  EXTERNAL_READING_ONLY: { ar: "قراءة خارجية فقط", en: "External reading only" },
  METADATA_ONLY: { ar: "بيانات فهرسية فقط", en: "Metadata only" },
  NEEDS_ITEM_LEVEL_REVIEW: { ar: "قيد مراجعة حقوق المورد", en: "Item-level rights review pending" },
  RIGHTS_UNCLEAR: { ar: "الحقوق غير محسومة", en: "Rights unclear" },
  RESTRICTED: { ar: "مقيد", en: "Restricted" },
};

const FORMAT_LABELS: Record<string, string> = {
  TXT_MARKDOWN: "نص رقمي منظم",
  PDF: "PDF",
  EPUB: "EPUB",
  OCR_TEXT: "نص OCR",
  HTML_OCR: "HTML / OCR",
  JP2_IMAGE_SET: "صور صفحات JP2",
};

const RIGHTS_PENDING = new Set([
  "NEEDS_ITEM_LEVEL_REVIEW",
  "RIGHTS_UNCLEAR",
  "RESTRICTED",
  "DOWNLOAD_REQUIRES_LICENSE_REVIEW",
]);

export function categoryLabel(category: string | null, lang: LibraryUiLanguage): string {
  if (!category || category.startsWith("UNCLASSIFIED")) {
    return lang === "ar" ? "غير مصنف بعد" : "Not yet classified";
  }
  return CATEGORY_LABELS[category]?.[lang] ?? (lang === "ar" ? "غير مصنف بعد" : "Not yet classified");
}

export function availabilityState(
  digital: CatalogDigitalEvidence | null,
  versionCount: number,
): AvailabilityState {
  if (!digital) return versionCount > 0 ? "digital_unavailable" : "metadata_only";
  if (RIGHTS_PENDING.has(digital.rights)) return "rights_review";
  if (digital.iiifUrl) return "iiif";
  if (digital.format === "PDF") return "pdf";
  if (digital.format.includes("OCR") || digital.ocrAvailable) return "ocr";
  if (digital.reading === "CAN_IMPORT_TEXT" || digital.searchableText) return "full_text";
  if (digital.itemUrl && digital.reading === "EXTERNAL_READER_ONLY") return "external_reader";
  return "digital_unavailable";
}

export function availabilityLabel(state: AvailabilityState, lang: LibraryUiLanguage): string {
  return AVAILABILITY_LABELS[state][lang];
}

export function rightsLabel(rights: string, lang: LibraryUiLanguage): string {
  return RIGHTS_LABELS[rights]?.[lang] ?? (lang === "ar" ? "حالة الحقوق موثقة في تفاصيل المصدر" : "See source details for rights status");
}

export function formatLabel(format: string, lang: LibraryUiLanguage): string {
  if (lang === "en") return format === "TXT_MARKDOWN" ? "Structured digital text" : format.replaceAll("_", " ");
  return FORMAT_LABELS[format] ?? "صيغة رقمية موثقة";
}

export interface ShelfPromotionCandidate {
  titleAr: string;
  titleEn: string;
  authorAr: string;
  authorEn: string;
  category: string;
  sourceIds: string[];
  bibliographicStatus: string;
  versionCount: number;
}

export function qualifiesForArchitecturalShelf(candidate: ShelfPromotionCandidate): boolean {
  return Boolean(
    candidate.titleAr.trim()
      && candidate.titleEn.trim()
      && candidate.authorAr.trim()
      && candidate.authorEn.trim()
      && candidate.category.trim()
      && candidate.sourceIds.length
      && candidate.bibliographicStatus === "verified_bibliographic"
      && candidate.versionCount > 0,
  );
}
