/**
 * Seerah immersive journey — ordered cinematic stops (2026 reference pack).
 *
 * Ten stops derived from 03_IMMERSIVE_SEERAH, each bound to a real cinematic
 * world plate (seerah-worlds.ts) and to canonical chapter/event ids from
 * seerahData.ts. The journey is a *visual orientation layer*: historical
 * records stay in the canonical data and the chronological database.
 *
 * Honesty contract:
 * - No prophetic or companion depiction; plates are terrain/architecture art.
 * - Every stop carries an Arabic illustrative-reconstruction disclosure.
 * - Stop order is narrative orientation, not a calibrated historical calendar.
 * - Deep links point only at existing /seerah chapter/event selections.
 */

import { seerahWorldPlate, type SeerahWorldId } from "./seerah-worlds";

export interface JourneyStop {
  id: SeerahWorldId;
  titleAr: string;
  eraAr: string;
  orientationAr: string;
  disclosureAr: string;
  /** Canonical chapter deep link. */
  chapterId: string;
  /** Optional canonical station inside that chapter. */
  eventId?: string;
}

export const SEERAH_JOURNEY_STOPS: JourneyStop[] = [
  {
    id: "makkah-before-islam",
    titleAr: "مكة قبل البعثة",
    eraAr: "سنة الفيل — بيئة الجاهلية",
    orientationAr:
      "وادي مكة بين الجبال الصخرية، وبيت عتيق يقصده الناس من كل فج. من هذه البيئة خرج النور.",
    disclosureAr:
      "لوحة فنية توضيحية لبيئة مكة قبل الإسلام — تضاريس عامة وليست مسحًا أثريًا ولا تصويرًا لأشخاص.",
    chapterId: "birth-and-upbringing",
  },
  {
    id: "hira",
    titleAr: "غار حراء",
    eraAr: "بدء الوحي — رمضان",
    orientationAr:
      "جبل النور يعلو مكة، وفي أعلاه غار صغير كان محل التحنث. هنا بدأ نزول القرآن.",
    disclosureAr:
      "مشهد ليلي توضيحي لجبل حراء — بيئة مكانية فقط، لا تصوير للوحي ولا لأي شخصية.",
    chapterId: "prophethood-beginning",
    eventId: "first-revelation",
  },
  {
    id: "hijrah-night",
    titleAr: "ليلة الهجرة",
    eraAr: "السنة 13 من البعثة",
    orientationAr:
      "ليل مكة، وبداية طريق طويل نحو المدينة. خرج النبي ﷺ وصاحبه في رحلة غيّرت مجرى التاريخ.",
    disclosureAr:
      "لوحة ليلية توضيحية لبيئة بداية الهجرة — لا تجسيد للنبي ﷺ ولا لأصحابه، والموضع تقريبي.",
    chapterId: "hijra-to-madinah",
    eventId: "hijra-start",
  },
  {
    id: "hijrah-thawr",
    titleAr: "غار ثور",
    eraAr: "ثلاث ليالٍ في الغار",
    orientationAr:
      "غار في جبل ثور جنوب مكة، اختبأ فيه النبي ﷺ وأبو بكر ثلاث ليالٍ. ﴿لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا﴾.",
    disclosureAr:
      "مشهد توضيحي لبيئة غار ثور الصخرية — لا تمثيل للأشخاص ولا للأحداث، والموضع تقريبي.",
    chapterId: "hijra-to-madinah",
    eventId: "cave-thawr",
  },
  {
    id: "hijrah-desert",
    titleAr: "درب الصحراء",
    eraAr: "طريق الهجرة إلى يثرب",
    orientationAr:
      "رمال وحرّ ومسافات طويلة، ودليل خبير بالطرق. عبر الدرب حتى بلغ قباءً على مشارف المدينة.",
    disclosureAr:
      "لوحة صحراوية توضيحية لدرب الهجرة — المسار تخطيطي تعليمي وليس مسارًا جغرافيًا مثبتًا.",
    chapterId: "hijra-to-madinah",
    eventId: "arrival-quba",
  },
  {
    id: "hijrah-overview",
    titleAr: "من مكة إلى المدينة",
    eraAr: "نظرة عامة على الهجرة",
    orientationAr:
      "المسار الكامل للهجرة: مكة، غار ثور، الدرب الساحلي، قباء، ثم المدينة المنورة.",
    disclosureAr:
      "مشهد بانورامي توضيحي يجمع بيئات الهجرة — تخطيط سردي لا خريطة مساحية دقيقة.",
    chapterId: "hijra-to-madinah",
  },
  {
    id: "madinah-walk",
    titleAr: "شوارع المدينة الأولى",
    eraAr: "السنة الأولى الهجرية",
    orientationAr:
      "مسجد من جريد وسقف بسيط، وبيوت من طين، ومؤاخاة بين المهاجرين والأنصار. هنا قامت الدولة.",
    disclosureAr:
      "لوحة توضيحية لبيئة المدينة في عهد التأسيس — عمارة عامة مستلهمة من الوصف، ليست أثرًا موثقًا.",
    chapterId: "establishing-state",
    eventId: "mosque-building",
  },
  {
    id: "badr",
    titleAr: "وادي بدر",
    eraAr: "رمضان ٢ هـ — يوم الفرقان",
    orientationAr:
      "وادي بين تلال رملية، وماء قريب، ومطر ليلة المعركة. أول مواجهة كبرى في تاريخ الدولة.",
    disclosureAr:
      "مشهد بيئي توضيحي لوادي بدر — لا مقاتلين ولا قتال ولا تجسيد؛ التضاريس تخطيطية.",
    chapterId: "battles-conquests",
    eventId: "badr",
  },
  {
    id: "badr-timeline",
    titleAr: "مسار الغزوات",
    eraAr: "٢–٩ هـ — الدفاع والفتوح",
    orientationAr:
      "من بدر إلى أحد فالخندق فخيبر، ثم فتح مكة وحنين وتبوك. خط زمني بصري لمحطات الدفاع.",
    disclosureAr:
      "لوحة تخطيطية لمسار الغزوات — ترتيب سردي تعليمي، والمواضع تقريبية بلا إحداثيات مساحية.",
    chapterId: "battles-conquests",
  },
  {
    id: "fath-makkah",
    titleAr: "فتح مكة",
    eraAr: "رمضان ٨ هـ — الفتح والأمان",
    orientationAr:
      "دخلها النبي ﷺ متواضعًا شاكرًا، وقال لمن ظلموه: «اذهبوا فأنتم الطلقاء». عفا عمن قدر عليه.",
    disclosureAr:
      "مشهد ليلي توضيحي لمكة عند الفتح — أجواء تأملية عامة، لا تصوير للأحداث ولا للأشخاص.",
    chapterId: "battles-conquests",
    eventId: "mecca-conquest",
  },
];

export function journeyStopById(id: string): JourneyStop | null {
  return SEERAH_JOURNEY_STOPS.find((stop) => stop.id === id) ?? null;
}

export function journeyStopPlate(stop: JourneyStop): string {
  return seerahWorldPlate(stop.id);
}

/** Deep link into the canonical Seerah reading selection for a stop. */
export function journeyStopHref(stop: JourneyStop): string {
  const chapter = `chapter=${encodeURIComponent(stop.chapterId)}`;
  return stop.eventId
    ? `/seerah?${chapter}&event=${encodeURIComponent(stop.eventId)}`
    : `/seerah?${chapter}`;
}
