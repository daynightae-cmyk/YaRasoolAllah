/**
 * WorldStations — the unified immersion log across every section.
 *
 * One registry, one shape. Every station points at a REAL route that the
 * app already serves (App.tsx) and, where the route exposes an immersive
 * surface, at the query flag that opens it:
 *
 *   /quran?sanctuary=1    → reading sanctuary (3D interior)
 *   /hadith?archive=1     → hadith archive (3D interior)
 *   /sources?treasury=1   → sources treasury (3D interior)
 *   /audio?studio=1       → audio studio (3D interior)
 *   /atlas                → atlas terrain theatre
 *   /library              → library halls
 *   /noor                 → Noor media theatre
 *   /kids                 → kids discovery garden
 *   /seerah/database      → governed seerah record log
 *
 * The living world mounts this log inside its HUD so a visitor can move
 * from the desert camp to the archive, the atlas or the media theatre
 * without losing their place. Nothing here is invented content: the
 * registry only composes routes that already exist.
 */

import type { WorldStation, WorldStationSection } from "@/visual-golden/components/seerah/world/world-types";

/** Section metadata for the station log (Arabic labels + order). */
export interface WorldStationSectionMeta {
  id: WorldStationSection;
  labelAr: string;
  order: number;
}

export const WORLD_STATION_SECTIONS: WorldStationSectionMeta[] = [
  { id: "seerah", labelAr: "السيرة", order: 1 },
  { id: "quran", labelAr: "القرآن", order: 2 },
  { id: "hadith", labelAr: "الحديث", order: 3 },
  { id: "sources", labelAr: "المصادر", order: 4 },
  { id: "audio", labelAr: "الصوت", order: 5 },
  { id: "atlas", labelAr: "الأطلس", order: 6 },
  { id: "library", labelAr: "المكتبة", order: 7 },
  { id: "noor", labelAr: "نور", order: 8 },
  { id: "kids", labelAr: "الأطفال", order: 9 },
];

/**
 * The live-world scene stations. Kept as data (not derived from the scene
 * registry) so the log can carry its own Arabic orientation copy and its
 * own disclosure; the world page resolves the ids against the registry and
 * drops a station whose scene no longer exists.
 */
const WORLD_SCENE_STATIONS: WorldStation[] = [
  {
    id: "station-world-desert-camp",
    sectionId: "seerah",
    titleAr: "درب الصحراء ومعسكر القوافل",
    subtitleAr: "ممر صحراوي يربط بيئات السيرة ومعسكر قوافل على جانب الطريق.",
    href: "/seerah/world?scene=desert-camp",
    kind: "world-scene",
    sceneId: "desert-camp",
    disclosureAr:
      "بيئة صحراوية ومعسكر قوافل ثلاثية الأبعاد تفسيرية — تضاريس عامة، عمارة غير موثقة، لا تجسيد لأي شخصية تاريخية.",
  },
  {
    id: "station-world-hira-cave",
    sectionId: "seerah",
    titleAr: "غار حراء",
    subtitleAr: "جبل نور يعلو مكة، وفي أعلاه غار صغير كان محل التحنث.",
    href: "/seerah/world?scene=hira-cave",
    kind: "world-scene",
    sceneId: "hira-cave",
    disclosureAr:
      "بيئة جبل وغار ثلاثية الأبعاد تفسيرية لحراء — أبعاد الغار ومسار الصعود تقريبية فنية، ولا إعادة تمثيل للوحي ولا تجسيد لأي شخصية.",
  },
  {
    id: "station-world-madinah-walk",
    sectionId: "seerah",
    titleAr: "شوارع المدينة الأولى",
    subtitleAr: "مسجد من جريد وسقف بسيط، وبيوت من طين، ومؤاخاة بين المهاجرين والأنصار.",
    href: "/seerah/world?scene=madinah-walk",
    kind: "world-scene",
    sceneId: "madinah-walk",
    disclosureAr:
      "بيئة مدينة أولى ثلاثية الأبعاد تفسيرية ليثرب — عمارة عامة غير موثقة، بلا قبة خضراء ولا مآذن متأخرة، ولا تجسيد للأشخاص.",
  },
  {
    id: "station-world-badr-valley",
    sectionId: "seerah",
    titleAr: "وادي بدر",
    subtitleAr: "وادي بين تلال رملية، وماء قريب، ومطر ليلة المعركة.",
    href: "/seerah/world?scene=badr-valley",
    kind: "world-scene",
    sceneId: "badr-valley",
    disclosureAr:
      "بيئة وادٍ ثلاثية الأبعاد تفسيرية لبدر — تضاريس عامة بلا نشر موثق للجيوش، ولا تجسيد ولا قتال ولا لعب.",
  },
  {
    id: "station-world-uhud-mountain",
    sectionId: "seerah",
    titleAr: "جبل أحد",
    subtitleAr: "موقف مراقبة من السهل باتجاه جبل أحد؛ التضاريس تفسير فني لعلاقة المكان بالخبر.",
    href: "/seerah/world?scene=uhud-mountain",
    kind: "world-scene",
    sceneId: "uhud-mountain",
    disclosureAr:
      "بيئة جبلية ثلاثية الأبعاد تفسيرية لجبل أحد — ليست مسحًا أثريًا ولا إعادة تمثيل للمعركة، ولا تجسيد لأي شخصية.",
  },
  {
    id: "station-world-khandaq-trench",
    sectionId: "seerah",
    titleAr: "الخندق",
    subtitleAr: "خط دفاع حفره المسلمون حمايةً للمدينة؛ العرض هندسي تعليمي تقريبي.",
    href: "/seerah/world?scene=khandaq-trench",
    kind: "world-scene",
    sceneId: "khandaq-trench",
    disclosureAr:
      "إعادة بناء فنية ثلاثية الأبعاد لمبدأ الخندق — أبعاد تقريبية تعليمية، ليست مسحًا أثريًا ولا تمثيلًا للحصار أو القتال.",
  },
];

/** Cross-section immersion surfaces. */
const SECTION_STATIONS: WorldStation[] = [
  {
    id: "station-seerah-reading",
    sectionId: "seerah",
    titleAr: "قراءة السيرة",
    subtitleAr: "الفصول والأحداث والمصادر المحكومة في تجربة القراءة.",
    href: "/seerah",
    kind: "surface",
  },
  {
    id: "station-seerah-database",
    sectionId: "seerah",
    titleAr: "سجل السيرة",
    subtitleAr: "سجل زمني للأحداث مع نصوصها ومصادرها المحكومة.",
    href: "/seerah/database",
    kind: "surface",
  },
  {
    id: "station-quran-sanctuary",
    sectionId: "quran",
    titleAr: "محراب القرآن",
    subtitleAr: "مساحة قراءة ثلاثية الأبعاد فوق المصحف — النص يبقى في صفحة القراءة.",
    href: "/quran?sanctuary=1",
    kind: "surface",
    disclosureAr:
      "مساحة معمارية معاصرة مستوحاة من التصميم الإسلامي — مساحة فنية، لا أثر تاريخي موثق.",
  },
  {
    id: "station-hadith-archive",
    sectionId: "hadith",
    titleAr: "أرشيف الحديث",
    subtitleAr: "قاعة أرشيف ثلاثية الأبعاد للسجلات المحكومة.",
    href: "/hadith?archive=1",
    kind: "surface",
    disclosureAr:
      "قاعة أرشيف معاصرة مستوحاة من العمارة الإسلامية — مساحة فنية، لا أثر تاريخي موثق.",
  },
  {
    id: "station-sources-treasury",
    sectionId: "sources",
    titleAr: "خزانة المصادر",
    subtitleAr: "خزانة ثلاثية الأبعاد لعناوين المصادر وحقوقها المسجلة.",
    href: "/sources?treasury=1",
    kind: "surface",
    disclosureAr:
      "خزانة معاصرة مستوحاة من العمارة الإسلامية — مساحة فنية، لا أثر تاريخي موثق.",
  },
  {
    id: "station-audio-studio",
    sectionId: "audio",
    titleAr: "استوديو التلاوة",
    subtitleAr: "استوديو استماع ثلاثي الأبعاد يتابع مشغّل التلاوة الحقيقي.",
    href: "/audio?studio=1",
    kind: "surface",
    disclosureAr:
      "استوديو معاصر مستوحى من عمارة المساجد — مساحة فنية، ولا يحتوي أي نص أو صوت مقدس.",
  },
  {
    id: "station-atlas-theatre",
    sectionId: "atlas",
    titleAr: "مسرح الأطلس",
    subtitleAr: "مسرح تضاريس ثلاثي الأبعاد لمواقع الخريطة — تخطيط توضيحي لا مسح جغرافي.",
    href: "/atlas",
    kind: "surface",
    disclosureAr:
      "مسرح تضاريس تفسيري للمواقع — تمثيل فني تخطيطي، وليس خريطة مساحية دقيقة.",
  },
  {
    id: "station-library-halls",
    sectionId: "library",
    titleAr: "معارض المكتبة",
    subtitleAr: "أروقة المكتبة ثلاثية الأبعاد فوق الفهارس الكاملة.",
    href: "/library",
    kind: "surface",
    disclosureAr:
      "أروقة معمارية معاصرة مستوحاة من التصميم الإسلامي — مساحة فنية، لا أثر تاريخي موثق.",
  },
  {
    id: "station-noor-theatre",
    sectionId: "noor",
    titleAr: "مسرح نور",
    subtitleAr: "مسرح وسائط مستقل يعرض المواد المراجعة فقط.",
    href: "/noor",
    kind: "surface",
  },
  {
    id: "station-kids-garden",
    sectionId: "kids",
    titleAr: "حديقة الاكتشاف",
    subtitleAr: "مسار اكتشاف آمن للأطفال مع اختبارات قصيرة.",
    href: "/kids",
    kind: "surface",
  },
];

/** Every station, ordered by section then by declaration order. */
export const WORLD_STATIONS: WorldStation[] = [...WORLD_SCENE_STATIONS, ...SECTION_STATIONS];

/** Stations grouped by section, in the canonical section order. */
export function getStationsBySection(
  stations: WorldStation[] = WORLD_STATIONS,
): Array<{ section: WorldStationSectionMeta; stations: WorldStation[] }> {
  return WORLD_STATION_SECTIONS.map((section) => ({
    section,
    stations: stations.filter((station) => station.sectionId === section.id),
  })).filter((group) => group.stations.length > 0);
}

/** Look up one station by id. */
export function getStationById(id: string): WorldStation | null {
  return WORLD_STATIONS.find((station) => station.id === id) ?? null;
}
