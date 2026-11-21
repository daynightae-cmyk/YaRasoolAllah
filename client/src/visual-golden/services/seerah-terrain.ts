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
export type TerrainKind = "mountain" | "trench" | "oasis-forts" | "valley" | "arid-plain";

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
  /** Canonical event id — must match GhazawatSceneConfig.eventId. */
  eventId: string;
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

/** Resolve a terrain scene by canonical event id, or null (keep plate path). */
export function getTerrainScene(eventId: string): TerrainSceneConfig | null {
  return TERRAIN_SCENES.find((scene) => scene.eventId === eventId) ?? null;
}

/** All terrain scenes in registry order. */
export function listTerrainScenes(): TerrainSceneConfig[] {
  return [...TERRAIN_SCENES];
}
