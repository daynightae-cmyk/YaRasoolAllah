import type { SeerahEra } from "./types";

/**
 * Ten narrative phases, ordered from the pre-natal context to the burial and
 * the immediate political succession. The phases are editorial divisions, not
 * claims that every event inside them has a precise calendar date.
 */
export const SEERAH_ERAS: SeerahEra[] = [
  {
    id: "pre-birth",
    order: 1,
    titleAr: "قبل المولد",
    titleEn: "Before the Birth",
    rangeAr: "قبل عام الفيل",
    summaryAr:
      "النسب والبيت الهاشمي وزواج عبد الله بآمنة، وحملة أبرهة على مكة التي سبقت المولد.",
    visualKey: "kaaba",
  },
  {
    id: "makkah-childhood",
    order: 2,
    titleAr: "المولد والنشأة",
    titleEn: "Birth and Childhood",
    rangeAr: "عام الفيل — نحو سن الثامنة",
    summaryAr:
      "الولادة في مكة، الرضاع في بني سعد، وفاة الأم والجد، وانتقال الكفالة إلى أبي طالب.",
    visualKey: "storyReading",
  },
  {
    id: "makkah-youth",
    order: 3,
    titleAr: "الشباب قبل البعثة",
    titleEn: "Youth before Prophethood",
    rangeAr: "نحو 12 — 40 سنة",
    summaryAr:
      "رحلات التجارة، الأمانة واللقب، الزواج بخديجة، بناء الكعبة، وبداية الخلوة في حراء.",
    visualKey: "reciterKaaba",
  },
  {
    id: "makkah-revelation",
    order: 4,
    titleAr: "بدء الوحي",
    titleEn: "The Beginning of Revelation",
    rangeAr: "40 سنة — السنوات الأولى للبعثة",
    summaryAr:
      "نزول القرآن الأول في غار حراء، تطمين خديجة وورقة، أوائل المسلمين، والدعوة السرية.",
    visualKey: "mushafOpen",
  },
  {
    id: "makkah-persecution",
    order: 5,
    titleAr: "الدعوة والاضطهاد",
    titleEn: "Public Call and Persecution",
    rangeAr: "نحو 3 — 13 سنة من البعثة",
    summaryAr:
      "الجهر بالدعوة، تعذيب المستضعفين، الهجرتان إلى الحبشة، المقاطعة، عام الحزن، الطائف، الإسراء، وبيعتا العقبة.",
    visualKey: "desert",
  },
  {
    id: "hijrah",
    order: 6,
    titleAr: "الهجرة",
    titleEn: "The Hijrah",
    rangeAr: "السنة 13 من البعثة / 622م",
    summaryAr:
      "مؤامرة قريش، غار ثور، الطريق إلى يثرب، قباء، ودخول المدينة.",
    visualKey: "storyHijrah",
  },
  {
    id: "madinah-foundation",
    order: 7,
    titleAr: "تأسيس المجتمع",
    titleEn: "Building the Community",
    rangeAr: "1 — 2 هـ",
    summaryAr:
      "المسجد النبوي، المؤاخاة، صحيفة المدينة، الأذان، تحويل القبلة، وفرض الصيام والزكاة.",
    visualKey: "mosque",
  },
  {
    id: "madinah-defense",
    order: 8,
    titleAr: "الدفاع والغزوات",
    titleEn: "Defence and Campaigns",
    rangeAr: "2 — 8 هـ",
    summaryAr:
      "بدر وأحد والخندق وبني قريظة والحديبية وخيبر ومؤتة وفتح مكة وحنين والطائف.",
    visualKey: "atlas",
  },
  {
    id: "madinah-consolidation",
    order: 9,
    titleAr: "الفتح والوفود",
    titleEn: "Consolidation and Delegations",
    rangeAr: "8 — 10 هـ",
    summaryAr:
      "تبوك، مسجد الضرار، عام الوفود، حج أبي بكر، وفاة إبراهيم، وحجة الوداع.",
    visualKey: "dome",
  },
  {
    id: "farewell-death",
    order: 10,
    titleAr: "الوداع والوفاة",
    titleEn: "Farewell and Death",
    rangeAr: "10 — 11 هـ / 632م",
    summaryAr:
      "خطبة الوداع، المرض الأخير، وفاة النبي ﷺ، خطبة أبي بكر، الدفن، وسقيفة بني ساعدة.",
    visualKey: "domeCard",
  },
];
