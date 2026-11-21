/**
 * Interior scene registry — genuine 3D architectural environments for the
 * institution's reading/research wings (directive §2, §3, §4.D).
 *
 * Where Seerah terrains reconstruct *kinds of historical places*, interiors
 * are contemporary institutional architecture inspired by Islamic design:
 * they are explicitly artistic spaces, never claims about a documented
 * historical building. Scripture and records are never rendered into scene
 * textures — canonical text stays in the governed DOM reading surfaces.
 *
 * The same observer contract as seerah-terrain.ts applies:
 * - neutral visitor, drag-to-look, node-to-node travel, exit at any time;
 * - reduced motion renders discrete frames and instant jumps;
 * - WebGL failure falls back to the caller's plate;
 * - every scene carries an always-visible Arabic artistic disclosure.
 */

/** Interior families the procedural builder understands. */
export type InteriorKind = "sanctuary" | "archive" | "treasury" | "studio" | "garden";

/** Optional architectural shell features; unset flags default to true. */
export interface InteriorShellConfig {
  colonnade?: boolean;
  mashrabiyaWindow?: boolean;
  mihrab?: boolean;
  entranceArch?: boolean;
  ceilingBeams?: boolean;
  dustMotes?: boolean;
}

/** One observer station inside an interior scene. Positions are scene-local. */
export interface InteriorNode {
  id: string;
  /** Arabic label shown on the in-scene hotspot and the node rail. */
  labelAr: string;
  /** What the visitor reflects on from this station (educational tone). */
  noteAr: string;
  /** Observer eye position [x, y, z]; y is absolute (floors are flat). */
  position: [number, number, number];
  /** Initial look target [x, y, z]. */
  lookAt: [number, number, number];
}

export interface InteriorSceneConfig {
  /** Stable scene id — canonical wing route identity. */
  sceneId: string;
  kind: InteriorKind;
  /** Deterministic seed so the same scene builds identically every visit. */
  seed: number;
  /** Ambient palette (hex). */
  wall: string;
  floor: string;
  accent: string;
  /** Warm lantern light color (hex). */
  lantern: string;
  /** Background/fog ink (hex); defaults to deep emerald-black. */
  ink?: string;
  /** Hemisphere sky tint (hex); defaults to institutional emerald. */
  ambient?: string;
  /** Architectural shell feature flags (see interior-engine). */
  shell?: InteriorShellConfig;
  /** Ordered observer stations; travel is node-to-node, never free-fly. */
  nodes: InteriorNode[];
  /** Always-visible Arabic artistic-space disclosure. */
  disclosureAr: string;
}

const INTERIOR_SCENES: InteriorSceneConfig[] = [
  {
    sceneId: "quran-sanctuary",
    kind: "sanctuary",
    seed: 1401,
    wall: "#0e2a26",
    floor: "#1c2b2a",
    accent: "#d4a017",
    lantern: "#ffb45e",
    nodes: [
      {
        id: "entrance",
        labelAr: "مدخل الرواق",
        noteAr:
          "تدخل رواق قراءة هادئًا صُمم فنيًا بروح العمارة الإسلامية: أقواس مدببة، أعمدة حجرية، وضوء دافئ من فوانيس نحاسية. المكان مساحة معاصرة للتدبر، وليس إعادة بناء لمسجد تاريخي.",
        position: [0, 1.7, 10.5],
        lookAt: [0, 1.4, -3],
      },
      {
        id: "rehal",
        labelAr: "حامل المصحف",
        noteAr:
          "حامل المصحف الخشبي (الرحل) في وسط الرواق. النص القرآني نفسه لا يُرسم داخل المشهد؛ تقرأه حرفيًا من نسخة Tanzil الموثقة في وضع القراءة أسفل الرواق، وتختار الآية والسورة من الفهرس.",
        position: [0, 1.62, 1.6],
        lookAt: [0, 1.15, -2.4],
      },
      {
        id: "light-window",
        labelAr: "نافذة النور",
        noteAr:
          "نافذة المشربية تتسلل منها إضاءة دافئة عبر شبكة هندسية. زر «المصباح» في شريط الأدوات يتحكم فعليًا في إضاءة الفوانيس والنافذة داخل هذا المشهد.",
        position: [-7.6, 1.7, -3.4],
        lookAt: [-12.6, 3.1, -3.4],
      },
      {
        id: "mihrab-corner",
        labelAr: "ركن التدبر",
        noteAr:
          "ركن هادئ باتجاه المحراب الفني. من هنا يمكنك العودة إلى القراءة المركزة أو وضع الدراسة (ترجمة وتفسير بمصادرهما المستقلة) دون أن يفقد المصحف موضعك المحفوظ.",
        position: [7.2, 1.7, -6.6],
        lookAt: [0, 2.6, -12.4],
      },
    ],
    disclosureAr:
      "رواق قراءة فني معاصر مستوحى من العمارة الإسلامية — ليس إعادة بناء لمسجد تاريخي، ولا يَرِد نص قرآني داخل المشهد نفسه؛ النص الموثق يُعرض في وضع القراءة خارجه.",
  },
  {
    sceneId: "hadith-archive",
    kind: "archive",
    seed: 1402,
    wall: "#122421",
    floor: "#221c14",
    accent: "#d4a017",
    lantern: "#ffb45e",
    ink: "#070d0b",
    ambient: "#2e4438",
    shell: { mihrab: false, colonnade: true, mashrabiyaWindow: true },
    nodes: [
      {
        id: "entrance",
        labelAr: "مدخل الدار",
        noteAr:
          "تدخل دار حديث صُممت فنيًا بروح المكتبات الإسلامية: رفوف خشبية عالية، فوانيس نحاسية، ومكتب دراسة في الصدر. هذه مساحة بحث معاصرة وليست إعادة بناء لمكتبة تاريخية بعينها.",
        position: [0, 1.7, 10.5],
        lookAt: [0, 1.3, -3],
      },
      {
        id: "study-desk",
        labelAr: "مكتب الدراسة",
        noteAr:
          "على المكتب رحل مفتوح وريشة ومحبرة وعدسة فحص — أدوات الباحث. نص السجل نفسه لا يُرسم في المشهد؛ تقرأ المتن ودرجته ومراجعته التحريرية حرفيًا في بطاقة السجل أعلى المشهد، مع تمييز «عينة تطوير».",
        position: [0, 1.62, 0.6],
        lookAt: [0, 1.05, -3.2],
      },
      {
        id: "collection-wall",
        labelAr: "جدار المصنفات",
        noteAr:
          "رفوف المصنفات ترمز إلى الأمهات الببليوغرافية. تذكّر التمييز الأمين: الأعداد المعروفة للمصنفات ليست حجم المتن المحلي؛ المتاح هنا سجلات تطويرية قليلة قيد المراجعة، والبطاقات في الواجهة الكاملة تفصل بين الأمرين.",
        position: [-7.4, 1.7, -1.2],
        lookAt: [-12.6, 2.4, -2.2],
      },
      {
        id: "verification-corner",
        labelAr: "ركن التحقق",
        noteAr:
          "ركن هادئ بجانب نافذة النور. من هنا تتحقق: الدرجة ومصدرها ومقيّمها إن ذُكر، وحالة المراجعة التحريرية، ثم الروابط المثبتة في البيانات إلى السيرة — لا يُخترع سند ولا حكم. زر «البحث والتحقق» يفتح الموسوعة الحديثية الخارجية.",
        position: [7.4, 1.7, -6.4],
        lookAt: [2, 2.2, -12.4],
      },
    ],
    disclosureAr:
      "دار حديث فنية معاصرة مستوحاة من العمارة الإسلامية — ليست إعادة بناء لمكتبة تاريخية، ولا يَرِد نص أحاديث داخل المشهد نفسه؛ السجلات ودرجاتها تُعرض في بطاقة السجل خارجه مع تمييز عينات التطوير.",
  },
  {
    sceneId: "sources-treasury",
    kind: "treasury",
    seed: 1403,
    wall: "#0d2622",
    floor: "#1a2420",
    accent: "#d4a017",
    lantern: "#ffb45e",
    ink: "#060f0d",
    ambient: "#2c4a3e",
    shell: { mihrab: false, colonnade: true, mashrabiyaWindow: true },
    nodes: [
      {
        id: "entrance",
        labelAr: "مدخل الخزانة",
        noteAr:
          "تدخل خزانة مصادر صُممت فنيًا بروح أرشيفات المخطوطات: أدراج فهرسة خشبية بإطارات نحاسية، طاولة فحص وثائق، وضوء دافئ من فوانيس معلقة. مساحة معاصرة لتتبّع المصادر وليست إعادة بناء لخزانة تاريخية بعينها.",
        position: [0, 1.7, 10.5],
        lookAt: [0, 1.3, -3],
      },
      {
        id: "catalog-wall",
        labelAr: "جدار الفهرسة",
        noteAr:
          "أدراج الفهرسة ترمز إلى أقسام المصادر الحقيقية: القرآن والحديث والسيرة والمكتبة وسجل المصادر. اختيار درج في بطاقة الفهرس أعلى المشهد يرشّح السجلات الفعلية فعلًا — ولا تُعرض أعداد مختلقة؛ ما تراه هو حجم الفهرس المحلي الحقيقي.",
        position: [-7.4, 1.7, 1.2],
        lookAt: [-12.6, 1.8, -1.4],
      },
      {
        id: "document-desk",
        labelAr: "طاولة الوثائق",
        noteAr:
          "على الطاولة لفافة فحص وعدسة وقلم ومحبرة وختم شمعي — أدوات تتبّع المصدر. الوثيقة نفسها لا تُرسم في المشهد؛ تقرأ تفاصيل السجل الحقيقية (النوع، الإتاحة، سبب اليقين، معرّفات المصادر) في بطاقة السجل أعلى المشهد، ثم تفتح سجله الكامل في واجهته.",
        position: [0, 1.62, 0.8],
        lookAt: [0, 1.05, -3.0],
      },
      {
        id: "verification-shield",
        labelAr: "درع التحقق",
        noteAr:
          "درع زجاجي مضيء يرمز إلى حالة التحقق: موثّق، تقريبي، أو تخطيطي — كما يعلنها كل سجل بنفسه مع سببه. التحقق البرمجي ليس اعتمادًا علميًا شرعيًا؛ ولا تُخترع جهات اعتماد ولا أعداد مراجعات، والقيم المجهولة تُعرض كما هي.",
        position: [8.4, 1.7, -4.2],
        lookAt: [6.2, 1.55, -8.6],
      },
    ],
    disclosureAr:
      "خزانة مصادر فنية معاصرة مستوحاة من العمارة الإسلامية — ليست إعادة بناء لخزانة تاريخية، ولا تُرسم نصوص الوثائق داخل المشهد نفسه؛ تفاصيل السجلات وحالات التحقق تُعرض في بطاقة السجل خارجه، والتحقق البرمجي ليس اعتمادًا علميًا شرعيًا.",
  },
  {
    sceneId: "audio-studio",
    kind: "studio",
    seed: 1404,
    wall: "#0e2a26",
    floor: "#1d2a28",
    accent: "#d4a017",
    lantern: "#ffb45e",
    ink: "#061009",
    ambient: "#2e4a3c",
    shell: { mihrab: false, colonnade: true, mashrabiyaWindow: true },
    nodes: [
      {
        id: "entrance",
        labelAr: "مدخل الاستوديو",
        noteAr:
          "تدخل استوديو استماع صُمم فنيًا بروح العمارة الإسلامية: رحل مصحف وسماعات على سجادة دائرية، وشريط صوتي ذهبي معلق. مساحة استماع معاصرة وليست إعادة بناء لقاعة تاريخية؛ الصوت نفسه بث حقيقي من خوادم المزوّد المرخّص.",
        position: [0, 1.7, 10.5],
        lookAt: [0, 1.3, -3],
      },
      {
        id: "rehal",
        labelAr: "رحل التلاوة",
        noteAr:
          "الرحل الخشبي وسماعات الاستماع في قلب الاستوديو. غلاف المصحف زخرفة هندسية بحتة — لا يُرسم نص قرآني داخل المشهد؛ النص الموثق يُقرأ في رواق القرآن. أزرار التشغيل والتكرار والمفضلة في بطاقة الاستماع أعلى المشهد تتحكم بالبث الحقيقي فعلًا.",
        position: [0, 1.62, -0.1],
        lookAt: [0.1, 0.9, -2.5],
      },
      {
        id: "sound-ribbon",
        labelAr: "شريط الصوت",
        noteAr:
          "الشريط الذهبي المعلق تمثيل صادق لحالة الاستماع: يتحرك فقط أثناء تشغيل التلاوة فعلًا، ويتجمد عند الإيقاف أو تفضيل تقليل الحركة — لا حركة دائمة مختلقة. الموضع والوقت الحقيقيان يظهران في بطاقة الاستماع، لا في المشهد.",
        position: [0, 1.7, -1.2],
        lookAt: [0, 2.5, -8.4],
      },
      {
        id: "reciter-catalog",
        labelAr: "خزانة القراء",
        noteAr:
          "خزانة التسجيلات ترمز إلى فهرس القراء الحقيقي: الأسماء والروايات وروابط البث تأتي من استجابة MP3Quran الرسمية لكل سورة، وتختارها من بطاقة الاستماع أعلى المشهد. لا صور مولدة لقراء ولا أصوات مصطنعة؛ وعند غياب صورة موثقة تبقى الزخرفة محايدة.",
        position: [-6.9, 1.7, 1.2],
        lookAt: [-12.3, 1.5, -1.4],
      },
    ],
    disclosureAr:
      "استوديو استماع فني معاصر مستوحى من العمارة الإسلامية — ليس إعادة بناء لقاعة تاريخية، ولا يَرِد نص قرآني داخل المشهد نفسه؛ شريط الصوت يتحرك فقط أثناء التشغيل الحقيقي للبث المرخّص، وأسماء القراء وروابطهم من استجابة المزوّد الرسمية لا من توليد.",
  },
];

export function getInteriorScene(sceneId: string): InteriorSceneConfig | null {
  return INTERIOR_SCENES.find((scene) => scene.sceneId === sceneId) ?? null;
}

export function listInteriorScenes(): InteriorSceneConfig[] {
  return [...INTERIOR_SCENES];
}
