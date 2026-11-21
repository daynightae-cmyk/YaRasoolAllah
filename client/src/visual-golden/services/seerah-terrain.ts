/**
 * Seerah terrain registry — genuine 3D observer environments for Ghazawat.
 *
 * The 2026 reference pack provides ten cinematic Seerah plates; five battle
 * events (uhud, khandaq, khaybar, hunayn, tabuk) have no dedicated plate and
 * previously fell back to schematic SVG art. This registry replaces that
 * fallback with *procedural Three.js terrain*: real geometry the visitor can
 * walk between linked observer nodes, look around, and exit — never a static
 * background swap.
 *
 * Honesty contract (same as seerah-ghazawat.ts):
 * - No prophetic/companion depiction, no combatants, no gore, no gameplay.
 * - Terrain is an artistic interpretation of the *kind* of place described in
 *   the sources (mountain, trench edge, oasis forts, narrow valley, arid
 *   plain) — not a survey, not exact army placement, not archaeology.
 * - Every node label and the scene disclosure state the illustrative nature.
 * - Historical facts stay in `client/src/data/seerah/events-madinah.ts`.
 */

/** Terrain families the procedural builder understands. */
export type TerrainKind =
  | "mountain"
  | "trench"
  | "oasis-forts"
  | "valley"
  | "arid-plain"
  | "settlement"
  | "lanes"
  | "mountain-cave";

/** One observer station inside a terrain scene. Positions are scene-local. */
export interface TerrainNode {
  id: string;
  /** Arabic label shown on the in-scene hotspot and the node rail. */
  labelAr: string;
  /** What the visitor studies from this station (educational, sourced tone). */
  noteAr: string;
  /** Observer eye position [x, y, z]; y is added to terrain height. */
  position: [number, number, number];
  /** Initial look target [x, y, z]. */
  lookAt: [number, number, number];
}

export interface TerrainSceneConfig {
  /** Canonical event id — must match GhazawatSceneConfig.eventId or a
   *  canonical station id from seerahData.ts. */
  eventId: string;
  /** Optional canonical chapter id when the scene opens a chapter environment
   *  rather than a single station. */
  chapterId?: string;
  kind: TerrainKind;
  /** Deterministic seed so the same scene builds identically every visit. */
  seed: number;
  /** Sky/fog palette for the scene (hex). */
  sky: string;
  fog: string;
  /** Ground base color (hex). */
  ground: string;
  /** Rock/accent color (hex). */
  rock: string;
  /** Warm key-light color (hex). */
  sun: string;
  /** Ordered observer stations; travel is node-to-node, never free-fly. */
  nodes: TerrainNode[];
  /** Always-visible Arabic reconstruction disclosure. */
  disclosureAr: string;
}

const TERRAIN_SCENES: TerrainSceneConfig[] = [
  {
    eventId: "uhud",
    kind: "mountain",
    seed: 301,
    sky: "#2a1f14",
    fog: "#3d2c1a",
    ground: "#6b5136",
    rock: "#7d6248",
    sun: "#ffd9a0",
    nodes: [
      {
        id: "plain-view",
        labelAr: "من السهل نحو الجبل",
        noteAr:
          "موقف مراقبة من السهل باتجاه جبل أحد؛ التضاريس هنا تفسير فني لعلاقة المكان بالخبر، وليست نشرًا للجيوش.",
        position: [0, 1.7, 26],
        lookAt: [0, 6, -18],
      },
      {
        id: "hillside",
        labelAr: "سفح الجبل",
        noteAr:
          "من السفح تظهر صخور الجبل الحمراء المعروفة في وصف أحد؛ البيئة الجبلية تشرح لماذا كان للموضع أثر في مجرى الحدث.",
        position: [-14, 3.4, 4],
        lookAt: [4, 8, -20],
      },
      {
        id: "pass-lookout",
        labelAr: "مطل الممر",
        noteAr:
          "مطل فني على ممر بين الصخور — محطة تأملية لدرس الثبات، بلا تجسيد للأشخاص ولا تمثيل للقتال.",
        position: [10, 5.2, -6],
        lookAt: [-6, 4, 16],
      },
    ],
    disclosureAr:
      "بيئة جبلية ثلاثية الأبعاد تفسيرية لجبل أحد — ليست مسحًا أثريًا ولا إعادة تمثيل للمعركة، ولا تجسيد لأي شخصية.",
  },
  {
    eventId: "khandaq",
    kind: "trench",
    seed: 502,
    sky: "#0b1020",
    fog: "#131a2e",
    ground: "#4a4038",
    rock: "#5c544a",
    sun: "#9fb4ff",
    nodes: [
      {
        id: "trench-edge",
        labelAr: "حافة الخندق",
        noteAr:
          "من الحافة يُقرأ مبدأ الخندق كخط دفاع حفره المسلمون حمايةً للمدينة؛ العرض هندسي تعليمي تقريبي.",
        position: [0, 1.7, 14],
        lookAt: [0, -1, -2],
      },
      {
        id: "trench-inside",
        labelAr: "داخل الخندق (إعادة بناء فنية)",
        noteAr:
          "نزول فني آمن إلى قاع الخندق لإدراك عمقه وعرضه التقريبيين؛ الأبعاد تفسيرية وليست قياسًا موثقًا.",
        position: [4, -1.4, 0],
        lookAt: [-10, 0, 0],
      },
      {
        id: "city-side",
        labelAr: "جهة المدينة",
        noteAr:
          "من الجهة المقابلة يظهر كيف حُميت المدينة من جهة كانت مكشوفة؛ الرياح والليل جزء من وصف المصادر للظروف.",
        position: [-2, 1.7, -14],
        lookAt: [2, 0, 2],
      },
    ],
    disclosureAr:
      "إعادة بناء فنية ثلاثية الأبعاد لمبدأ الخندق — أبعاد تقريبية تعليمية، ليست مسحًا أثريًا ولا تمثيلًا للحصار أو القتال.",
  },
  {
    eventId: "khaybar",
    kind: "oasis-forts",
    seed: 703,
    sky: "#332413",
    fog: "#4a3a22",
    ground: "#8a6f4d",
    rock: "#6e5a41",
    sun: "#ffe3b0",
    nodes: [
      {
        id: "oasis-approach",
        labelAr: "مدخل الواحة",
        noteAr:
          "خيبر واحة نخيل وحصون متفرقة في المصادر؛ النخيل هنا عنصر بيئي عام مستلهم من طبيعة الواحات.",
        position: [0, 1.7, 24],
        lookAt: [0, 4, -10],
      },
      {
        id: "fort-base",
        labelAr: "أسفل الحصن",
        noteAr:
          "كتل حجرية عامة تحاكي فكرة الحصون المتفرقة دون ادعاء شكل معماري موثق لحصن بعينه.",
        position: [-10, 1.7, 2],
        lookAt: [-12, 6, -12],
      },
      {
        id: "palm-grove",
        labelAr: "بين النخيل",
        noteAr:
          "محطة هادئة بين النخيل لقراءة سياق الحدث في قاعدة البيانات؛ لا تصوير للأشخاص ولا للأحداث.",
        position: [12, 1.7, -4],
        lookAt: [0, 3, 14],
      },
    ],
    disclosureAr:
      "مشهد واحات وحصون ثلاثي الأبعاد توضيحي — عمارة عامة غير موثقة لحصن بعينه، ولا تجسيد لأي شخصية.",
  },
  {
    eventId: "hunayn",
    kind: "valley",
    seed: 804,
    sky: "#1d2416",
    fog: "#2c3524",
    ground: "#75604a",
    rock: "#66584a",
    sun: "#f4d9a6",
    nodes: [
      {
        id: "valley-mouth",
        labelAr: "فم الوادي",
        noteAr:
          "وادٍ جبلي ضيق بين مرتفعات — الشكل العام مستلهم من وصف وادي حنين، دون بيانات جغرافية دقيقة.",
        position: [0, 1.7, 22],
        lookAt: [0, 5, -14],
      },
      {
        id: "valley-floor",
        labelAr: "قاع الوادي",
        noteAr:
          "من القاع يُدرك معنى التضاريس الضيقة في سرد الحدث؛ لا مقاتلين ولا تمثيل، والموضع تفسيري.",
        position: [3, 1.7, 0],
        lookAt: [-8, 6, -10],
      },
      {
        id: "ridge-view",
        labelAr: "مطل الحافة",
        noteAr:
          "مطل من حافة الوادي على الممر؛ محطة لفهم درس التوازن بين الكثرة والثبات، من نص الحدث الموثق.",
        position: [-10, 4.6, -8],
        lookAt: [4, 2, 12],
      },
    ],
    disclosureAr:
      "بيئة وادٍ ثلاثية الأبعاد تفسيرية لوادي حنين — تضاريس عامة بلا إحداثيات موثقة، ولا تجسيد ولا قتال.",
  },
  {
    eventId: "tabuk",
    kind: "arid-plain",
    seed: 905,
    sky: "#3a2c17",
    fog: "#5a4526",
    ground: "#a8845c",
    rock: "#8f7350",
    sun: "#ffefc4",
    nodes: [
      {
        id: "open-plain",
        labelAr: "الصحراء المفتوحة",
        noteAr:
          "مسافات طويلة وحرّ شديد في وصف رحلة تبوك؛ السهل هنا يعبّر عن بُعد المسافة لا عن مسار محدد.",
        position: [0, 1.7, 24],
        lookAt: [0, 3, -20],
      },
      {
        id: "rock-outcrop",
        labelAr: "نتوء صخري",
        noteAr:
          "نتوءات صخرية متفرقة كما في طرق شمال الحجاز؛ محطة قراءة لسياق العزم والمشقة في الحدث.",
        position: [-12, 1.7, 0],
        lookAt: [8, 2, -14],
      },
      {
        id: "camp-context",
        labelAr: "موضع المخيم (تخطيطي)",
        noteAr:
          "موضع تخطيطي لمخيم الرحلة — لا خيام معاد تمثيلها بدقة ولا أشخاص؛ السياق من نص الحدث ومصادره.",
        position: [10, 1.7, -10],
        lookAt: [-4, 2, 10],
      },
    ],
    disclosureAr:
      "بيئة صحراوية ثلاثية الأبعاد تفسيرية لرحلة تبوك — مسافات عامة تخطيطية، ليست مسارًا مثبتًا ولا تمثيلًا للأشخاص.",
  },
];

// Guard against a typo slipping into a color token: every palette entry must
// be a valid 6-digit hex color before the scene ever reaches the renderer.
for (const scene of TERRAIN_SCENES) {
  for (const key of ["sky", "fog", "ground", "rock", "sun"] as const) {
    if (!/^#[0-9a-fA-F]{6}$/.test(scene[key])) {
      throw new Error(`seerah-terrain: invalid ${key} color for ${scene.eventId}: ${scene[key]}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Chapter / station observer environments (directive §4.B)            */
/* ------------------------------------------------------------------ */

const CHAPTER_TERRAIN_SCENES: TerrainSceneConfig[] = [
  {
    eventId: "birth",
    chapterId: "birth-and-upbringing",
    kind: "settlement",
    seed: 1101,
    sky: "#2b2013",
    fog: "#45351e",
    ground: "#8a6f52",
    rock: "#6e5138",
    sun: "#ffd9a0",
    nodes: [
      {
        id: "makkah-approach",
        labelAr: "مدخل مكة (تفسيري)",
        noteAr:
          "مساكن حجرية وطينية بسيطة بين جبال مكة قبل البعثة؛ الشكل العام مستلهم من عمارة الحجاز القديمة، وليس توثيقًا لدار بعينها.",
        position: [0, 1.7, 24],
        lookAt: [0, 2, -8],
      },
      {
        id: "makkah-dwellings",
        labelAr: "بين المساكن",
        noteAr:
          "أزقة ومساكن متقاربة توحي بنسيج مكة الاجتماعي والتجاري؛ السياق الاجتماعي يُقرأ من لوحات المصادر في الفصل، لا من المشهد.",
        position: [-8, 1.7, 2],
        lookAt: [6, 2, -6],
      },
      {
        id: "makkah-mountains",
        labelAr: "نحو الجبال المحيطة",
        noteAr:
          "مكة محاطة بجبال صخرية؛ من هذه المحطة تُدرك علاقة المدينة بتضاريسها، وهي علاقة ثابتة في وصف المصادر.",
        position: [10, 2.6, -12],
        lookAt: [-4, 6, -26],
      },
    ],
    disclosureAr:
      "بيئة مساكن وجبال ثلاثية الأبعاد تفسيرية لمكة قبل البعثة — عمارة عامة غير موثقة لدار بعينها، ولا تجسيد لأي شخصية.",
  },
  {
    eventId: "first-revelation",
    chapterId: "prophethood-beginning",
    kind: "mountain-cave",
    seed: 1202,
    sky: "#0c1120",
    fog: "#141c30",
    ground: "#5c4a38",
    rock: "#7a5a44",
    sun: "#b8c8ff",
    nodes: [
      {
        id: "hira-approach",
        labelAr: "مدخل جبل حراء",
        noteAr:
          "جبل نور شمال مكة، وفيه غار حراء؛ المشهد ليلي هادئ يهيئ للقراءة، ولا يعيد تمثيل الوحي ولا يصوّره.",
        position: [0, 1.7, 26],
        lookAt: [10, 8, -18],
      },
      {
        id: "hira-path",
        labelAr: "مسار الصعود",
        noteAr:
          "مسار صخري صاعد نحو الغار — مسار فني تقريبي ليس قياسًا للطريق الفعلي؛ القراءة المرتبطة بالمصادر تبقى في الفصل.",
        position: [4, 3.2, 0],
        lookAt: [10, 7, -18],
      },
      {
        id: "hira-cave",
        labelAr: "داخل الغار (إعادة بناء فنية)",
        noteAr:
          "حجرة صخرية صغيرة بإضاءة قمرية خافتة؛ الغار في المصادر موضع خلوة وتأمل. لا تمثيل للوحي ولا صوت مُصنّع منسوب إليه.",
        position: [10, 1.6, -18],
        lookAt: [10, 2, 20],
      },
      {
        id: "hira-lookout",
        labelAr: "مطل الغار على مكة",
        noteAr:
          "من فم الغار يُطل على السهل باتجاه مكة؛ محطة تأملية لقراءة نص الحدث ومصادره بهدوء.",
        position: [10, 2.2, -13],
        lookAt: [-6, 1, 24],
      },
    ],
    disclosureAr:
      "بيئة جبل وغار ثلاثية الأبعاد تفسيرية لحراء — أبعاد الغار ومسار الصعود تقريبية فنية، ولا إعادة تمثيل للوحي ولا تجسيد لأي شخصية.",
  },
  {
    eventId: "secret-dawah",
    chapterId: "secret-public-dawah",
    kind: "lanes",
    seed: 1303,
    sky: "#332413",
    fog: "#4a3a22",
    ground: "#8f7355",
    rock: "#75604a",
    sun: "#ffe3b0",
    nodes: [
      {
        id: "lane-mouth",
        labelAr: "فم الزقاق",
        noteAr:
          "أزقة مكة الصخرية الضيقة عند الشروق؛ البيئة توحي بمسارات الدعوة الأولى دون تحديد مواضع بعينها.",
        position: [0, 1.7, 22],
        lookAt: [0, 2, -10],
      },
      {
        id: "lane-market",
        labelAr: "سوق صغير (تفسيري)",
        noteAr:
          "مظلات سوق عامة توحي بالحياة التجارية لمكة؛ تفاصيل الأسواق تُقرأ من المصادر، والمشهد لا يوثق سوقًا بعينه.",
        position: [3, 1.7, 2],
        lookAt: [-6, 2, -8],
      },
      {
        id: "lane-end",
        labelAr: "مخرج الزقاق نحو الجبل",
        noteAr:
          "نهاية الممر نحو الصخور؛ محطة قراءة لأحداث الدعوة العلنية وما رافقها من صبر، من نص الفصل الموثق.",
        position: [-2, 1.7, -14],
        lookAt: [4, 5, -28],
      },
    ],
    disclosureAr:
      "بيئة أزقة وسوق ثلاثية الأبعاد تفسيرية لمكة زمن الدعوة — عمارة عامة تخطيطية، ولا تجسيد للأشخاص ولا حوارات مُختلقة.",
  },
  {
    eventId: "cave-thawr",
    chapterId: "hijra-to-madinah",
    kind: "mountain-cave",
    seed: 1404,
    sky: "#0a0e1a",
    fog: "#121a2a",
    ground: "#54453a",
    rock: "#6b5a4a",
    sun: "#a8bcf0",
    nodes: [
      {
        id: "thawr-approach",
        labelAr: "مدخل جبل ثور",
        noteAr:
          "جبل ثور جنوب مكة؛ المشهد ليلي هادئ يستحضر ظرف الهجرة كما ورد في المصادر، دون إعادة تمثيل للأحداث.",
        position: [0, 1.7, 26],
        lookAt: [10, 8, -18],
      },
      {
        id: "thawr-path",
        labelAr: "مسار صخري صاعد",
        noteAr:
          "صعود فني تقريبي نحو الغار؛ لا تحديد للمسار الفعلي، والسياق يُقرأ من سجل محطة «غار ثور» ومصادره.",
        position: [4, 3.2, 0],
        lookAt: [10, 7, -18],
      },
      {
        id: "thawr-cave",
        labelAr: "داخل الغار (إعادة بناء فنية)",
        noteAr:
          "حجرة صخرية معتمة بإضاءة قمرية؛ الغار موضع اختفاء في سرد الهجرة. لا أشخاص ولا أصوات مُصنّعة منسوبة لأحد.",
        position: [10, 1.6, -18],
        lookAt: [10, 2, 20],
      },
      {
        id: "thawr-lookout",
        labelAr: "مطل الغار",
        noteAr:
          "من فم الغار يُراقب السهل ليلًا؛ محطة تأملية مرتبطة برواية الهجرة الموثقة في قاعدة البيانات.",
        position: [10, 2.2, -13],
        lookAt: [-6, 1, 24],
      },
    ],
    disclosureAr:
      "بيئة جبل وغار ثلاثية الأبعاد تفسيرية لثور — أبعاد تقريبية فنية، ليست مسحًا أثريًا ولا إعادة تمثيل لأحداث الهجرة.",
  },
  {
    eventId: "hijra-start",
    chapterId: "hijra-to-madinah",
    kind: "arid-plain",
    seed: 1505,
    sky: "#141a2c",
    fog: "#1e2740",
    ground: "#6e5c48",
    rock: "#5f5346",
    sun: "#c8d4ff",
    nodes: [
      {
        id: "route-start",
        labelAr: "بداية الطريق (تخطيطي)",
        noteAr:
          "ليل الصحراء وبُعد المسافة في رحلة الهجرة؛ الطريق هنا تعبير فني عن الرحلة، وليس مسارًا جغرافيًا مثبتًا.",
        position: [0, 1.7, 26],
        lookAt: [0, 2, -18],
      },
      {
        id: "route-valley",
        labelAr: "منخفض بين الصخور",
        noteAr:
          "منخفضات وممرات صخرية كما في طرق الحجاز؛ المحطة تشرح طبيعة التضاريس لا موضعًا محددًا من السيرة.",
        position: [-10, 1.7, 6],
        lookAt: [6, 3, -12],
      },
      {
        id: "route-pass",
        labelAr: "ممر جبلي",
        noteAr:
          "ممر بين مرتفعات تحت سماء ليلية؛ التنقل بين المحطات يحاكي معنى الرحلة الطويلة دون ادعاء خط سير موثق.",
        position: [8, 2.8, -6],
        lookAt: [-6, 2, 14],
      },
      {
        id: "route-dawn",
        labelAr: "أفق مفتوح",
        noteAr:
          "أفق صحراوي مفتوح يوحي بامتداد الطريق نحو يثرب؛ سجل الرحلة الكامل ومصادره في قاعدة بيانات السيرة.",
        position: [0, 1.7, -20],
        lookAt: [0, 3, 24],
      },
    ],
    disclosureAr:
      "بيئة صحراوية ليلية ثلاثية الأبعاد تفسيرية لطريق الهجرة — ليست مسارًا مثبتًا بالأدلة، ولا تجسيد للأشخاص ولا للأحداث.",
  },
  {
    eventId: "arrival-quba",
    chapterId: "hijra-to-madinah",
    kind: "settlement",
    seed: 1606,
    sky: "#2e2413",
    fog: "#46381f",
    ground: "#7d6b4a",
    rock: "#665844",
    sun: "#ffe9b8",
    nodes: [
      {
        id: "quba-grove",
        labelAr: "نخيل قباء",
        noteAr:
          "قباء واحة نخيل جنوب يثرب؛ النخيل عنصر بيئي عام مستلهم من طبيعة الواحات، لا توثيقًا لمزرعة بعينها.",
        position: [8, 1.7, 20],
        lookAt: [-4, 3, -6],
      },
      {
        id: "quba-dwellings",
        labelAr: "مساكن بسيطة",
        noteAr:
          "مساكن طينية وحجرية متفرقة توحي بمستوطنة صغيرة؛ سياق الوصول يُقرأ من سجل محطة «الوصول إلى قباء».",
        position: [-6, 1.7, 4],
        lookAt: [6, 2, -8],
      },
      {
        id: "quba-context",
        labelAr: "موضع سياقي (تفسيري)",
        noteAr:
          "محطة هادئة لقراءة سياق بناء مسجد قباء كأول مسجد في الإسلام، من المصادر؛ لا إعادة بناء معمارية موثقة.",
        position: [2, 1.7, -10],
        lookAt: [-8, 3, 12],
      },
    ],
    disclosureAr:
      "بيئة واحة ومساكن ثلاثية الأبعاد تفسيرية لقباء — عمارة عامة غير موثقة، ولا تجسيد لأي شخصية.",
  },
  {
    eventId: "arrival-madinah",
    chapterId: "establishing-state",
    kind: "settlement",
    seed: 1707,
    sky: "#3a3020",
    fog: "#54452c",
    ground: "#93765a",
    rock: "#7a6248",
    sun: "#fff0c8",
    nodes: [
      {
        id: "madinah-entry",
        labelAr: "مدخل يثرب (تفسيري)",
        noteAr:
          "مساكن بسيطة ونخيل وساحة ترابية؛ الصورة العامة مستلهمة من وصف المدينة الأولى ببساطتها، بلا قباب ولا مآذن لاحقة.",
        position: [0, 1.7, 24],
        lookAt: [0, 2, -10],
      },
      {
        id: "madinah-courtyard",
        labelAr: "ساحة المسجد الأول (تفسيري)",
        noteAr:
          "ساحة مسوّرة بأعمدة جذوع وسقف سعف — إعادة بناء فنية لفكرة المسجد الأول كما تصفه المصادر، وليست أثرًا موثقًا.",
        position: [-8, 1.7, 0],
        lookAt: [-10, 2, -10],
      },
      {
        id: "madinah-market",
        labelAr: "جهة السوق",
        noteAr:
          "مظلات سوق عامة توحي بالحياة الاقتصادية للمدينة الناشئة؛ تفاصيل المجتمع تُقرأ من سجلات الفصل ومصادره.",
        position: [10, 1.7, -6],
        lookAt: [-4, 2, 10],
      },
    ],
    disclosureAr:
      "بيئة مدينة أولى ثلاثية الأبعاد تفسيرية ليثرب — بلا قبة خضراء ولا مآذن متأخرة، عمارة عامة غير موثقة، ولا تجسيد للأشخاص.",
  },
  {
    eventId: "badr",
    chapterId: "battles-conquests",
    kind: "valley",
    seed: 1808,
    sky: "#2c2214",
    fog: "#42331d",
    ground: "#8f7355",
    rock: "#6e5a45",
    sun: "#ffdf9e",
    nodes: [
      {
        id: "badr-hill",
        labelAr: "مطل العدوة",
        noteAr:
          "بدر وادٍ بين عدوتين؛ من المرتفع يُدرك معنى «العدوة الدنيا والقصوى» في وصف المصادر، دون نشر للجيوش.",
        position: [-10, 4.4, 10],
        lookAt: [4, 1, -6],
      },
      {
        id: "badr-valley",
        labelAr: "قاع الوادي",
        noteAr:
          "قاع رملي فيه مواضع آبار في المصادر؛ المشهد يشرح التضاريس فقط، ولا يحدد مواضع المعسكرات تحديدًا موثقًا.",
        position: [2, 1.7, 0],
        lookAt: [-8, 4, 10],
      },
      {
        id: "badr-wells",
        labelAr: "جهة الآبار (تخطيطي)",
        noteAr:
          "منخفضات توحي بمواضع الماء التي ورد ذكرها؛ الترتيب الزمني والأحداث تُقرأ من الخط الزمني وسجل الغزوة.",
        position: [6, 1.7, -12],
        lookAt: [-4, 3, 8],
      },
    ],
    disclosureAr:
      "بيئة وادٍ ثلاثية الأبعاد تفسيرية لبدر — تضاريس عامة بلا نشر موثق للجيوش، ولا تجسيد ولا قتال ولا لعب.",
  },
  {
    eventId: "mecca-conquest",
    chapterId: "battles-conquests",
    kind: "settlement",
    seed: 1909,
    sky: "#33281a",
    fog: "#4c3d26",
    ground: "#8a6f52",
    rock: "#6e5138",
    sun: "#ffe9b8",
    nodes: [
      {
        id: "fath-approach",
        labelAr: "مدخل مكة من الشمال (تفسيري)",
        noteAr:
          "مقاربة المدينة من جهة المرتفعات؛ المشهد يهيئ لقراءة حدث الفتح من سجله الموثق، ولا يعيد تمثيل الدخول.",
        position: [0, 2.4, 24],
        lookAt: [0, 2, -8],
      },
      {
        id: "fath-dwellings",
        labelAr: "بين مساكن مكة",
        noteAr:
          "نسيج مساكن مكة القديم؛ السياق الاجتماعي والسياسي للفتح يُقرأ من المصادر، والمشهد بيئي عام.",
        position: [-8, 1.7, 2],
        lookAt: [6, 2, -8],
      },
      {
        id: "fath-sanctuary",
        labelAr: "جهة الحرم (سياقي)",
        noteAr:
          "ساحة مفتوحة توحي بمحيط الحرم دون إعادة بناء معمارية موثقة له في ذلك العهد؛ النص والمصادر في سجل المحطة.",
        position: [6, 1.7, -10],
        lookAt: [-6, 3, 8],
      },
    ],
    disclosureAr:
      "بيئة مدينة ثلاثية الأبعاد تفسيرية لمكة زمن الفتح — عمارة عامة غير موثقة للحرم أو المساكن، ولا تجسيد ولا إعادة تمثيل.",
  },
  {
    eventId: "farewell-hajj",
    chapterId: "farewell-hajj",
    kind: "arid-plain",
    seed: 2010,
    sky: "#3a2f1c",
    fog: "#57482c",
    ground: "#a08058",
    rock: "#8a6f4e",
    sun: "#fff2cc",
    nodes: [
      {
        id: "arafat-plain",
        labelAr: "سهل عرفات",
        noteAr:
          "سهل عرفات المفتوح وجبل الرحمة في أفقه؛ المشهد بيئي محايد لقراءة سياق حجة الوداع من مصادره الموثقة.",
        position: [0, 1.7, 24],
        lookAt: [0, 4, -20],
      },
      {
        id: "arafat-mount",
        labelAr: "جهة جبل الرحمة",
        noteAr:
          "نتوء صخري منخفض كما في وصف عرفات؛ لا تمثيل للخطبة ولا صوت مُصنّع منسوب للنبي ﷺ — القراءة من النص فقط.",
        position: [-8, 2.6, -6],
        lookAt: [6, 2, 10],
      },
      {
        id: "arafat-reflection",
        labelAr: "محطة تأمل",
        noteAr:
          "محطة هادئة لقراءة خطبة الوداع من مصادرها الثابتة في قاعدة البيانات، مع الإفصاح عن حالة المراجعة.",
        position: [8, 1.7, -14],
        lookAt: [-4, 3, 12],
      },
    ],
    disclosureAr:
      "بيئة سهل ثلاثية الأبعاد تفسيرية لعرفات — ليست مسحًا للموضع، ولا تمثيل للخطبة ولا صوت مُصنّع، ولا تجسيد لأي شخصية.",
  },
  {
    eventId: "final-illness",
    chapterId: "prophet-death",
    kind: "settlement",
    seed: 2111,
    sky: "#1c1a22",
    fog: "#2a2733",
    ground: "#6e6152",
    rock: "#5c5348",
    sun: "#d8cdb8",
    nodes: [
      {
        id: "closing-courtyard",
        labelAr: "ساحة هادئة (تفسيرية)",
        noteAr:
          "بيئة ختامية ساكنة بإضاءة خافتة لقراءة الفصل الأخير ومصادره؛ لا تمثيل للمرض ولا للوفاة ولا تجسيد لأي شخصية.",
        position: [0, 1.7, 20],
        lookAt: [0, 2, -8],
      },
      {
        id: "closing-dwellings",
        labelAr: "جهة المساكن",
        noteAr:
          "مساكن المدينة الأولى بصيغتها البسيطة؛ سياق الأيام الأخيرة يُقرأ من سجل المحطات الموثق، والمشهد بيئي محايد.",
        position: [-8, 1.7, 0],
        lookAt: [6, 2, -8],
      },
      {
        id: "closing-reflection",
        labelAr: "محطة ختام وتأمل",
        noteAr:
          "محطة تأملية هادئة تربط الفصل بالمصادر والأعمال ذات الصلة في المكتبة؛ القراءة الوثائقية هي المقصود لا المشهد الدرامي.",
        position: [8, 1.7, -10],
        lookAt: [-4, 2, 10],
      },
    ],
    disclosureAr:
      "بيئة ختامية ثلاثية الأبعاد ساكنة وتفسيرية — قراءة وثائقية هادئة، لا تمثيل للأحداث ولا تجسيد لأي شخصية.",
  },
];

for (const scene of CHAPTER_TERRAIN_SCENES) {
  for (const key of ["sky", "fog", "ground", "rock", "sun"] as const) {
    if (!/^#[0-9a-fA-F]{6}$/.test(scene[key])) {
      throw new Error(`seerah-terrain: invalid ${key} color for ${scene.eventId}: ${scene[key]}`);
    }
  }
}

const ALL_TERRAIN_SCENES: TerrainSceneConfig[] = [...TERRAIN_SCENES, ...CHAPTER_TERRAIN_SCENES];

/** Resolve a terrain scene by canonical event id, or null (keep plate path). */
export function getTerrainScene(eventId: string): TerrainSceneConfig | null {
  return ALL_TERRAIN_SCENES.find((scene) => scene.eventId === eventId) ?? null;
}

/** Resolve a chapter's opening terrain scene by canonical chapter id, or null.
 *  The first registered scene for a chapter is its opening environment;
 *  later scenes for the same chapter are station-level destinations. */
export function getChapterTerrainScene(chapterId: string): TerrainSceneConfig | null {
  return CHAPTER_TERRAIN_SCENES.find((scene) => scene.chapterId === chapterId) ?? null;
}

/** All station-level terrain scenes registered for a chapter, in order. */
export function listChapterStationScenes(chapterId: string): TerrainSceneConfig[] {
  return CHAPTER_TERRAIN_SCENES.filter((scene) => scene.chapterId === chapterId);
}

/** All terrain scenes in registry order. */
export function listTerrainScenes(): TerrainSceneConfig[] {
  return [...ALL_TERRAIN_SCENES];
}

/** Battle-event terrain scenes (the five plateless Ghazawat). */
export function listBattleTerrainScenes(): TerrainSceneConfig[] {
  return [...TERRAIN_SCENES];
}

/** Chapter/station observer terrain scenes. */
export function listChapterTerrainScenes(): TerrainSceneConfig[] {
  return [...CHAPTER_TERRAIN_SCENES];
}
