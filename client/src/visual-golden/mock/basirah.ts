/** VISUAL PROTOTYPE DATA — REPLACE WITH PRODUCTION DATA SOURCE.
 * Catalog metadata only. No fabricated scripture, hadith, tafsir, or fatwa.
 */
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

export const BASIRAH_CATALOG: BasirahRecord[] = [
  { id: "quran-reader", scope: "quran", titleAr: "رواق القرآن — مصحف القراءة", titleEn: "Qur’an reading hall", kindAr: "قارئ", kindEn: "reader", path: "/quran", hintAr: "لوحة القراءة وأدوات الآية.", hintEn: "Reading plane and verse tools." },
  { id: "quran-tafsir", scope: "quran", titleAr: "غرفة التفسير والتدبر", titleEn: "Tafsir study chamber", kindAr: "دراسة", kindEn: "study", path: "/tafsir", hintAr: "سياق الآية ومسارات التأمل.", hintEn: "Verse context and reflection paths." },
  { id: "quran-audio", scope: "quran", titleAr: "قاعة التلاوات", titleEn: "Recitation theatre", kindAr: "صوت", kindEn: "audio", path: "/audio", hintAr: "فهرس القراء وقوائم التلاوة.", hintEn: "Reciters and playlists." },
  { id: "hadith-archive", scope: "hadith", titleAr: "دار الحديث — المجموعات", titleEn: "Hadith archive — collections", kindAr: "أرشيف", kindEn: "archive", path: "/hadith", hintAr: "فهارس المجموعات والرواة.", hintEn: "Collection and narrator indexes." },
  { id: "seerah-journey", scope: "seerah", titleAr: "درب السيرة الزمني", titleEn: "Seerah timeline", kindAr: "رحلة", kindEn: "journey", path: "/seerah", hintAr: "محطات من المولد إلى الوداع.", hintEn: "Stations from birth to farewell." },
  { id: "atlas-map", scope: "seerah", titleAr: "الأطلس الجبلي للغزوات", titleEn: "Mountain atlas of expeditions", kindAr: "خريطة", kindEn: "map", path: "/atlas", hintAr: "مسارات بصرية دون إحداثيات إنتاج.", hintEn: "Visual routes, not production coordinates." },
  { id: "lib-hall", scope: "library", titleAr: "قاعة الرفوف الرقمية", titleEn: "Digital shelf hall", kindAr: "مكتبة", kindEn: "library", path: "/library", hintAr: "مجموعات وفهارس كتب.", hintEn: "Collections and book indexes." },
  { id: "daily-obs", scope: "sources", titleAr: "مرصد الصلاة", titleEn: "Prayer observatory", kindAr: "حساب", kindEn: "calculation", path: "/daily", hintAr: "مواقيت من مزوّد علني حسب الموقع.", hintEn: "Public-provider prayer times by location." },
  { id: "kids-theatre", scope: "library", titleAr: "مسرح قصص العائلة", titleEn: "Family story theatre", kindAr: "عائلة", kindEn: "family", path: "/kids", hintAr: "مسارات تعليمية للأسرة.", hintEn: "Family learning paths." },
];
