/** VISUAL PROTOTYPE DATA — REPLACE WITH PRODUCTION DATA SOURCE. */
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
  | "/basirah";

export const discoveryWings: {
  path: WingPath;
  ar: string;
  en: string;
  hint: string;
}[] = [
  { path: "/", ar: "بوابة النور", en: "Gateway of Light", hint: "المدخل الرئيسي للمؤسسة" },
  { path: "/quran", ar: "القرآن الكريم", en: "The Holy Qur’an", hint: "مصحف القراءة والأدوات" },
  { path: "/tafsir", ar: "التفسير والتدبر", en: "Tafsir & Tadabbur", hint: "معاني الآيات ومحاور التأمل" },
  { path: "/hadith", ar: "الحديث والسنة", en: "Hadith & Sunnah", hint: "المجموعات والرواة والموضوعات" },
  { path: "/library", ar: "المكتبة الرقمية", en: "Digital Library", hint: "الرفوف والمجموعات والمخطوطات" },
  { path: "/seerah", ar: "السيرة النبوية", en: "Prophetic Biography", hint: "رحلة زمنية من المولد إلى الوداع" },
  { path: "/atlas", ar: "أطلس الغزوات", en: "Atlas of Battles", hint: "خريطة جبلية ومسارات تفاعلية" },
  { path: "/kids", ar: "الأطفال والعائلة", en: "Kids & Family", hint: "قصص وأنشطة ودليل الوالدين" },
  { path: "/daily", ar: "مرصد الصلاة", en: "Prayer Observatory", hint: "مواقيت حية حسب المدينة والقبلة" },
  { path: "/audio", ar: "التلاوات الصوتية", en: "Qur’an Audio", hint: "قراء وقوائم تلاوة" },
  { path: "/basirah", ar: "بصيرة", en: "Basirah", hint: "رفيق البحث الموثَّق في المصادر" },
];
