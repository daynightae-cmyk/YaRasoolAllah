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
export type InteriorKind = "sanctuary";

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
];

export function getInteriorScene(sceneId: string): InteriorSceneConfig | null {
  return INTERIOR_SCENES.find((scene) => scene.sceneId === sceneId) ?? null;
}

export function listInteriorScenes(): InteriorSceneConfig[] {
  return [...INTERIOR_SCENES];
}
