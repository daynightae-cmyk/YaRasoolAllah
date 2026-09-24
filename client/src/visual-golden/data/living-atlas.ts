/**
 * Living mountain atlas — educational schematic theatre.
 * All x/y values are illustration layout slots, never geographic coordinates.
 * No prophetic depiction, invented GPS, or simulated military tracks.
 */

export type Certainty = "named-place" | "approximate" | "disputed" | "schematic";
export type MarkerKind = "terrain" | "water" | "camp" | "pass" | "maqam-nur" | "place";
export type WitnessKind = "quran" | "hadith" | "sira";
export type Weather =
  | "rain-afterglow"
  | "clear-dawn"
  | "dust-afternoon"
  | "granite-shadow"
  | "frost-wind"
  | "night-gale"
  | "lamps-approach"
  | "amnesty-dawn";

export interface Witness {
  kind: WitnessKind;
  arabic: string;
  cite: string;
}

export interface AtlasMarker {
  id: string;
  labelAr: string;
  x: number;
  y: number;
  kind: MarkerKind;
  certainty: Certainty;
  descriptionAr: string;
  source: string;
}

export interface AtlasPhase {
  id: string;
  titleAr: string;
  bodyAr: string;
  weather: Weather;
  hourLabel: string;
  activeMarkerIds: string[];
  witness: Witness;
  source: string;
}

export interface OverlayPath {
  id: string;
  d: string;
  labelAr: string;
  labelAt: { x: number; y: number };
  kind: "ridge" | "wadi" | "harrah" | "trench" | "basin";
  certainty: Certainty;
}

export interface Campaign {
  id: string;
  nameAr: string;
  nameEn: string;
  dateAr: string;
  datePrecision: string;
  locationAr: string;
  questionAr: string;
  terrainTeacherAr: string;
  mapTypeLabel: string;
  plate: string;
  distanceNote: string;
  confidenceLabel: string;
  disputeAr: string;
  geographicBasisAr: string;
  sources: string[];
  phases: AtlasPhase[];
  markers: AtlasMarker[];
  overlays: OverlayPath[];
}

export const CERTAINTY_LABEL: Record<Certainty, string> = {
  "named-place": "معلم مسمّى — موضعه على اللوحة تخطيطي",
  approximate: "تقريبي — لا يصلح للقياس",
  disputed: "مختلف في تحديده",
  schematic: "تخطيطي تعليمي",
};

export const WEATHER_LABEL: Record<Weather, string> = {
  "rain-afterglow": "فجر بعد مطر",
  "clear-dawn": "صباح هادئ",
  "dust-afternoon": "ظهيرة جبلية",
  "granite-shadow": "ظل الجبل",
  "frost-wind": "برد الحفر",
  "night-gale": "ريح ليلية",
  "lamps-approach": "ليل الاقتراب",
  "amnesty-dawn": "فجر ساكن",
};

const maqam = (
  id: string,
  labelAr: string,
  x: number,
  y: number,
  descriptionAr: string,
  source: string,
): AtlasMarker => ({
  id,
  labelAr,
  x,
  y,
  kind: "maqam-nur",
  certainty: "schematic",
  descriptionAr,
  source,
});

export const LIVING_CAMPAIGNS: Campaign[] = [
  {
    id: "badr",
    nameAr: "غزوة بدر",
    nameEn: "Badr",
    dateAr: "رمضان ٢ هـ",
    datePrecision: "التأريخ التفصيلي يُعرض بوصفه منقولًا من كتب المغازي",
    locationAr: "بدر بين مكة والمدينة",
    questionAr: "كيف يساعد الماء والوادي والمطر على فهم سياق بدر؟",
    terrainTeacherAr:
      "تُعامل بدر هنا بوصفها واديًا وماءً ومعالم مذكورة في الرواية، لا كساحة قتال معاد تمثيلها. العلامات تعليمية وتشرح علاقة الخبر بالمكان.",
    mapTypeLabel: "مخطط تضاريسي تعليمي — ليس خريطة مساحية",
    plate: "/visual-golden/art/atlas-hero.webp",
    distanceNote: "لا يوجد مقياس مسافة أو ادعاء GPS في هذه اللوحة.",
    confidenceLabel: "تقريبي للمواضع التفصيلية",
    disputeAr: "مواضع الآبار والعدوتين والعريش على اللوحة تخطيطية ولا تمثل مسحًا أثريًا.",
    geographicBasisAr: "لوحة فنية للوادي مع طبقات تفسيرية منفصلة عن الدقة الجغرافية.",
    sources: ["القرآن الكريم", "سيرة ابن هشام", "كتب المغازي"],
    phases: [
      {
        id: "badr-water",
        titleAr: "الماء والمكان",
        bodyAr:
          "يربط العرض بين خبر الماء والمشورة وبين أثر المطر المذكور في القرآن، من غير رسم معسكرات أو تحركات عسكرية.",
        weather: "rain-afterglow",
        hourLabel: "ليل إلى فجر",
        activeMarkerIds: ["badr-wells", "badr-near-bank", "badr-maqam"],
        witness: {
          kind: "quran",
          arabic: "وَيُنَزِّلُ عَلَيْكُم مِّنَ السَّمَاءِ مَاءً لِّيُطَهِّرَكُم بِهِ",
          cite: "الأنفال ١١",
        },
        source: "القرآن الكريم، مع سياق السيرة",
      },
      {
        id: "badr-criterion",
        titleAr: "يوم الفرقان",
        bodyAr:
          "تبقى الرواية في النص، بينما يكتفي المشهد بالوادي والماء والضوء ومعالم ذات يقين معلن.",
        weather: "clear-dawn",
        hourLabel: "صباح",
        activeMarkerIds: ["badr-wadi", "badr-wells", "badr-far-bank"],
        witness: {
          kind: "quran",
          arabic: "يَوْمَ الْفُرْقَانِ يَوْمَ الْتَقَى الْجَمْعَانِ",
          cite: "الأنفال ٤١",
        },
        source: "القرآن الكريم",
      },
      {
        id: "badr-context",
        titleAr: "قراءة المكان",
        bodyAr:
          "يمكن للقارئ الانتقال بين المعالم وقراءة درجة اليقين ومصدر الوصف بدل تلقي مشهد بصري يوحي بدقة غير موجودة.",
        weather: "clear-dawn",
        hourLabel: "بعد الحدث",
        activeMarkerIds: ["badr-wadi", "badr-maqam"],
        witness: {
          kind: "sira",
          arabic: "تفاصيل المواضع تُقرأ من روايات السيرة وتُعرض هنا بحدودها، لا كإحداثيات.",
          cite: "كتب السيرة والمغازي",
        },
        source: "سيرة ابن هشام وكتب المغازي",
      },
    ],
    markers: [
      {
        id: "badr-wadi",
        labelAr: "بطن الوادي",
        x: 52,
        y: 49,
        kind: "terrain",
        certainty: "named-place",
        descriptionAr: "اسم بدر ومعالم الوادي من سياق الرواية؛ موقع العلامة داخل اللوحة تخطيطي.",
        source: "كتب السيرة والمغازي",
      },
      {
        id: "badr-wells",
        labelAr: "آبار بدر",
        x: 44,
        y: 60,
        kind: "water",
        certainty: "approximate",
        descriptionAr: "الماء عنصر مركزي في رواية الحدث، لكن العلامة لا تعني بئرًا محددًا بإحداثيات.",
        source: "سيرة ابن هشام",
      },
      {
        id: "badr-near-bank",
        labelAr: "العدوة الدنيا",
        x: 30,
        y: 63,
        kind: "terrain",
        certainty: "approximate",
        descriptionAr: "تمثيل تعليمي لجهة مذكورة في النص، لا نقطة مساحية.",
        source: "الأنفال وكتب التفسير والسيرة",
      },
      {
        id: "badr-far-bank",
        labelAr: "العدوة القصوى",
        x: 74,
        y: 39,
        kind: "terrain",
        certainty: "approximate",
        descriptionAr: "تمثيل تعليمي لجهة مذكورة في النص، بلا مقياس للمسافات.",
        source: "الأنفال وكتب التفسير والسيرة",
      },
      maqam(
        "badr-maqam",
        "مقام القيادة",
        35,
        41,
        "رمز نور مجرد لموضع سردي. لا هيئة ولا ظل ولا شخصية تمثل رسول الله ﷺ.",
        "كتب السيرة — خبر العريش",
      ),
    ],
    overlays: [
      {
        id: "badr-ridge",
        d: "M 4 28 C 22 14 48 18 72 12 C 86 8 96 16 99 22 L 99 34 C 70 24 28 32 4 38 Z",
        labelAr: "تلال محيطة",
        labelAt: { x: 70, y: 16 },
        kind: "ridge",
        certainty: "schematic",
      },
      {
        id: "badr-floor",
        d: "M 8 46 C 28 40 48 44 70 42 C 84 40 96 48 98 58 L 90 70 C 60 62 28 68 10 72 Z",
        labelAr: "قاع الوادي",
        labelAt: { x: 58, y: 54 },
        kind: "wadi",
        certainty: "schematic",
      },
    ],
  },
  {
    id: "uhud",
    nameAr: "غزوة أحد",
    nameEn: "Uhud",
    dateAr: "شوال ٣ هـ",
    datePrecision: "التاريخ التفصيلي يُنسب للمصادر عند عرضه",
    locationAr: "جبل أحد شمال المدينة",
    questionAr: "كيف يفسر الجبل أهمية الظهر والمرتفعات في سياق أحد؟",
    terrainTeacherAr:
      "جبل أحد معلم معروف، لكن خطوط التموضع على اللوحة ليست إعادة بناء عسكرية. وظيفة التضاريس هنا شرح علاقة الخبر بالمكان.",
    mapTypeLabel: "مخطط تضاريسي تعليمي — ليس مسحًا لجبل أحد",
    plate: "/visual-golden/art/atlas-hero.webp",
    distanceNote: "لا تُستعمل اللوحة لحساب مسافة أو اتجاه عسكري.",
    confidenceLabel: "المعلم معلوم، التفاصيل تقريبية",
    disputeAr: "خطوط الانتشار وموضع كل جماعة ليست مواضع قياس على هذه اللوحة.",
    geographicBasisAr: "لوحة جبلية فنية مع علامات تعليمية منفصلة عن الدقة المساحية.",
    sources: ["القرآن الكريم", "صحيح البخاري", "سيرة ابن هشام"],
    phases: [
      {
        id: "uhud-wall",
        titleAr: "الجبل كحماية",
        bodyAr:
          "يُعرض الجبل وجبل الرماة كمعلمين لفهم الرواية، بلا صفوف مقاتلين ولا محاكاة حركة.",
        weather: "dust-afternoon",
        hourLabel: "نهار",
        activeMarkerIds: ["uhud-ridge", "uhud-archers", "uhud-maqam"],
        witness: {
          kind: "hadith",
          arabic: "أُحُدٌ جَبَلٌ يُحِبُّنَا وَنُحِبُّهُ",
          cite: "صحيح البخاري",
        },
        source: "صحيح البخاري، مع سياق السيرة",
      },
      {
        id: "uhud-turn",
        titleAr: "تغيّر السياق",
        bodyAr:
          "تتغير الإضاءة بدل رسم التفاف أو قتال؛ الغرض إبراز أثر القرار والمكان على سرد الحدث.",
        weather: "granite-shadow",
        hourLabel: "آخر النهار",
        activeMarkerIds: ["uhud-archers", "uhud-field", "uhud-maqam"],
        witness: {
          kind: "quran",
          arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ",
          cite: "آل عمران ١٣٩",
        },
        source: "القرآن الكريم",
      },
      {
        id: "uhud-context",
        titleAr: "الجبل بعد الحدث",
        bodyAr:
          "تُقرأ تفاصيل السيرة من النص والمصدر، ويبقى المشهد الجبلي أداة لفهم الموضع لا لإعادة تمثيله.",
        weather: "granite-shadow",
        hourLabel: "مساء",
        activeMarkerIds: ["uhud-ridge", "uhud-maqam"],
        witness: {
          kind: "sira",
          arabic: "المشهد الجغرافي يشرح السياق، بينما الرواية تبقى منسوبة إلى مصادرها.",
          cite: "كتب السيرة",
        },
        source: "سيرة ابن هشام",
      },
    ],
    markers: [
      {
        id: "uhud-ridge",
        labelAr: "جبل أحد",
        x: 54,
        y: 23,
        kind: "terrain",
        certainty: "named-place",
        descriptionAr: "المعلم معروف، لكن تموضعه داخل اللوحة فني.",
        source: "مصادر السيرة والجغرافيا",
      },
      {
        id: "uhud-archers",
        labelAr: "جبل الرماة",
        x: 41,
        y: 52,
        kind: "terrain",
        certainty: "approximate",
        descriptionAr: "علامة تقريبية تساعد على شرح الرواية، لا تحديد مساحي.",
        source: "كتب السيرة",
      },
      {
        id: "uhud-field",
        labelAr: "جهة السهل",
        x: 62,
        y: 66,
        kind: "terrain",
        certainty: "schematic",
        descriptionAr: "مساحة تعليمية مجردة، لا خط مواجهة.",
        source: "السرد التعليمي",
      },
      maqam(
        "uhud-maqam",
        "مقام السرد",
        51,
        44,
        "نور مجرد يدل على نقطة سردية مختارة، بلا تجسيد لشخص النبي ﷺ.",
        "كتب السيرة",
      ),
    ],
    overlays: [
      {
        id: "uhud-wall",
        d: "M 0 8 C 18 2 40 0 58 4 C 78 8 94 6 100 10 L 100 32 C 70 22 30 26 0 34 Z",
        labelAr: "جدار الجبل",
        labelAt: { x: 50, y: 12 },
        kind: "ridge",
        certainty: "schematic",
      },
      {
        id: "uhud-wadi",
        d: "M 2 78 C 30 70 58 76 98 72 L 98 88 L 2 90 Z",
        labelAr: "جهة الوادي",
        labelAt: { x: 40, y: 84 },
        kind: "wadi",
        certainty: "schematic",
      },
    ],
  },
  {
    id: "khandaq",
    nameAr: "غزوة الخندق",
    nameEn: "Al-Khandaq",
    dateAr: "شوال ٥ هـ",
    datePrecision: "اليوم التفصيلي لا يُعرض كيقين مساحي أو زمني",
    locationAr: "الجهة الشمالية للمدينة",
    questionAr: "كيف يشرح الخندق والحرّتان والريح معنى الحصار دون تحويله إلى لعبة؟",
    terrainTeacherAr:
      "الخندق خط تعليمي في الأرض وليس مسارًا متريًا. الحرّتان وجبل سلع معالم سياق، والريح تُعبّر عنها الإضاءة والحركة الهادئة.",
    mapTypeLabel: "مخطط حصار تعليمي — بلا امتداد متري للخندق",
    plate: "/visual-golden/art/desert-trail.webp",
    distanceNote: "لا طول محسوب للخندق ولا مواقع مخيمات دقيقة.",
    confidenceLabel: "تقريبي للخطوط",
    disputeAr: "موضع امتداد الخندق ومواقع التجمعات لا تُقدّم هنا بوصفها نقاطًا أثرية محسومة.",
    geographicBasisAr: "لوحة حجازية ليلية مع قطع تخطيطي وتعريف واضح بحدود اليقين.",
    sources: ["القرآن الكريم", "سيرة ابن هشام", "كتب التاريخ"],
    phases: [
      {
        id: "khandaq-dig",
        titleAr: "قطع في الأرض",
        bodyAr:
          "المشهد يبرز فكرة الخندق والبيئة الصخرية، من غير مجارف أو أجساد أو محاكاة حفر.",
        weather: "frost-wind",
        hourLabel: "نهار بارد",
        activeMarkerIds: ["khandaq-trench", "khandaq-sala", "khandaq-maqam"],
        witness: {
          kind: "sira",
          arabic: "خبر حفر الخندق ومشورة سلمان رضي الله عنه يُقرأ من مصادر السيرة.",
          cite: "سيرة ابن هشام — الأحزاب",
        },
        source: "سيرة ابن هشام",
      },
      {
        id: "khandaq-hold",
        titleAr: "المرابطة",
        bodyAr:
          "تظهر الجهة الشمالية كمنطقة سردية فقط. لا تُرسم مخيمات أو أعداد أو تكتيكات غير موثقة.",
        weather: "frost-wind",
        hourLabel: "ليل الحصار",
        activeMarkerIds: ["khandaq-trench", "khandaq-north", "khandaq-harrah"],
        witness: {
          kind: "sira",
          arabic: "الخندق في العرض حاجز تعليمي، وليس إعادة بناء لمساره التاريخي.",
          cite: "كتب السيرة",
        },
        source: "كتب السيرة",
      },
      {
        id: "khandaq-wind",
        titleAr: "الريح",
        bodyAr:
          "يتغير المود بصريًا لأن القرآن يذكر الريح، مع بقاء الحركة مجرد أثر جوي لا محاكاة حدث.",
        weather: "night-gale",
        hourLabel: "ليل",
        activeMarkerIds: ["khandaq-north", "khandaq-maqam", "khandaq-trench"],
        witness: {
          kind: "quran",
          arabic: "فَأَرْسَلْنَا عَلَيْهِمْ رِيحًا وَجُنُودًا لَّمْ تَرَوْهَا",
          cite: "الأحزاب ٩",
        },
        source: "القرآن الكريم",
      },
    ],
    markers: [
      {
        id: "khandaq-harrah",
        labelAr: "الحرّة",
        x: 18,
        y: 49,
        kind: "terrain",
        certainty: "named-place",
        descriptionAr: "معلم جغرافي عام؛ حدود اللوحة فنية.",
        source: "مصادر الجغرافيا والسيرة",
      },
      {
        id: "khandaq-trench",
        labelAr: "الخندق",
        x: 50,
        y: 42,
        kind: "terrain",
        certainty: "approximate",
        descriptionAr: "الخط تعليمي ولا يمثل امتداد الحفر بقياس أو إحداثيات.",
        source: "سيرة ابن هشام",
      },
      {
        id: "khandaq-sala",
        labelAr: "جبل سلع",
        x: 58,
        y: 68,
        kind: "terrain",
        certainty: "named-place",
        descriptionAr: "المعلم معروف، أما علاقته الدقيقة بكل نقطة في المشهد فغير مقاسة هنا.",
        source: "مصادر السيرة والجغرافيا",
      },
      {
        id: "khandaq-north",
        labelAr: "الجهة الشمالية",
        x: 52,
        y: 18,
        kind: "camp",
        certainty: "schematic",
        descriptionAr: "اتجاه سردي عام، لا مخيم ولا تموضع عسكري.",
        source: "كتب السيرة",
      },
      maqam(
        "khandaq-maqam",
        "مقام الدعاء",
        56,
        64,
        "نور مجرد مرتبط بالسرد، بلا هيئة أو صوت منسوب للنبي ﷺ.",
        "كتب السيرة",
      ),
    ],
    overlays: [
      {
        id: "khandaq-east",
        d: "M 0 8 L 16 8 L 14 92 L 0 92 Z",
        labelAr: "حرّة",
        labelAt: { x: 8, y: 50 },
        kind: "harrah",
        certainty: "schematic",
      },
      {
        id: "khandaq-west",
        d: "M 84 8 L 100 8 L 100 92 L 86 92 Z",
        labelAr: "حرّة",
        labelAt: { x: 93, y: 50 },
        kind: "harrah",
        certainty: "schematic",
      },
      {
        id: "khandaq-cut",
        d: "M 18 40 C 40 46 62 38 82 42",
        labelAr: "قطع الخندق",
        labelAt: { x: 50, y: 36 },
        kind: "trench",
        certainty: "approximate",
      },
    ],
  },
  {
    id: "fath",
    nameAr: "فتح مكة",
    nameEn: "Conquest of Mecca",
    dateAr: "رمضان ٨ هـ",
    datePrecision: "التاريخ التفصيلي يُنسب لمصدره عند عرضه",
    locationAr: "مكة في وادٍ بين الجبال",
    questionAr: "كيف يتحول الوادي والممر إلى سياق بصري للفتح والعفو بلا تمثيل؟",
    terrainTeacherAr:
      "مكة وادٍ تحيطه المرتفعات. المشهد يركز على الممر والسكينة والعفو، ولا يحول الحدث إلى عرض جيوش أو إعادة بناء للحرم.",
    mapTypeLabel: "مخطط وادٍ جبلي تعليمي — ليست خريطة للحرم",
    plate: "/visual-golden/art/atlas-hero.webp",
    distanceNote: "لا تُستخدم اللوحة لحساب مسارات الدخول أو قياسها.",
    confidenceLabel: "تقريبي للممرات",
    disputeAr: "محاور الدخول والممرات في هذه التجربة سردية تقريبية، لا تحديدًا ميدانيًا.",
    geographicBasisAr: "لوحة فنية للوادي قبل الفجر مع علامات مجردة للمكان.",
    sources: ["القرآن الكريم", "صحيح مسلم", "سيرة ابن هشام"],
    phases: [
      {
        id: "fath-safety",
        titleAr: "ليل الأمان",
        bodyAr:
          "المشهد يعرض معنى الأمان في النصوص المرتبطة بالفتح، من غير استعراض مشاعل أو قوات.",
        weather: "lamps-approach",
        hourLabel: "ليل",
        activeMarkerIds: ["fath-pass", "fath-maqam"],
        witness: {
          kind: "hadith",
          arabic: "مَنْ دَخَلَ دَارَ أَبِي سُفْيَانَ فَهُوَ آمِنٌ، وَمَنْ أَغْلَقَ بَابَهُ فَهُوَ آمِنٌ",
          cite: "صحيح مسلم",
        },
        source: "صحيح مسلم",
      },
      {
        id: "fath-pass-phase",
        titleAr: "الممر",
        bodyAr:
          "تتحرك الإضاءة إلى الممر الجبلي فقط. لا ركب ولا هيئة ولا تمثيل لشخص النبي ﷺ.",
        weather: "lamps-approach",
        hourLabel: "ما قبل الفجر",
        activeMarkerIds: ["fath-pass", "fath-basin", "fath-maqam"],
        witness: {
          kind: "sira",
          arabic: "تفاصيل الدخول تُقرأ من كتب السيرة، بينما يظل المشهد البصري غير تجسيدي.",
          cite: "كتب السيرة — فتح مكة",
        },
        source: "كتب السيرة",
      },
      {
        id: "fath-dawn",
        titleAr: "فجر الحق",
        bodyAr:
          "تتحول اللوحة إلى ضوء الفجر مع الآية، ويظل المكان فارغًا من إعادة تمثيل الأشخاص.",
        weather: "amnesty-dawn",
        hourLabel: "فجر",
        activeMarkerIds: ["fath-basin", "fath-maqam", "fath-east"],
        witness: {
          kind: "quran",
          arabic: "وَقُلْ جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ ۚ إِنَّ الْبَاطِلَ كَانَ زَهُوقًا",
          cite: "الإسراء ٨١",
        },
        source: "القرآن الكريم",
      },
    ],
    markers: [
      {
        id: "fath-basin",
        labelAr: "بطن الوادي",
        x: 50,
        y: 58,
        kind: "place",
        certainty: "named-place",
        descriptionAr: "مكة في وادٍ، لكن موضع العلامة داخل اللوحة فني.",
        source: "مصادر السيرة والجغرافيا",
      },
      {
        id: "fath-east",
        labelAr: "المرتفعات الشرقية",
        x: 78,
        y: 36,
        kind: "terrain",
        certainty: "schematic",
        descriptionAr: "كتلة جبلية تعليمية، لا تحديد لقمة بعينها.",
        source: "السرد الجغرافي العام",
      },
      {
        id: "fath-west",
        labelAr: "المرتفعات الغربية",
        x: 22,
        y: 34,
        kind: "terrain",
        certainty: "schematic",
        descriptionAr: "كتلة جبلية تعليمية، لا تحديد لقمة بعينها.",
        source: "السرد الجغرافي العام",
      },
      {
        id: "fath-pass",
        labelAr: "جهة الممر",
        x: 48,
        y: 26,
        kind: "pass",
        certainty: "approximate",
        descriptionAr: "ممر سردي تقريبي لا مسار GPS.",
        source: "كتب السيرة",
      },
      maqam(
        "fath-maqam",
        "مقام التواضع",
        46,
        30,
        "نور مجرد للمشهد السردي، بلا راكب ولا وجه ولا جسم.",
        "كتب السيرة",
      ),
    ],
    overlays: [
      {
        id: "fath-ring",
        d: "M 6 20 C 18 6 40 4 50 8 C 68 4 88 10 96 22 L 92 40 C 70 22 30 22 8 38 Z",
        labelAr: "حلقة الجبال",
        labelAt: { x: 50, y: 10 },
        kind: "ridge",
        certainty: "schematic",
      },
      {
        id: "fath-floor",
        d: "M 22 48 C 40 42 60 42 78 50 L 74 72 C 50 64 30 70 24 68 Z",
        labelAr: "بطن الوادي",
        labelAt: { x: 50, y: 58 },
        kind: "basin",
        certainty: "schematic",
      },
    ],
  },
];

export function campaignById(id: string): Campaign {
  return LIVING_CAMPAIGNS.find((campaign) => campaign.id === id) ?? LIVING_CAMPAIGNS[0];
}
