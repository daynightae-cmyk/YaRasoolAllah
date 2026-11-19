/**
 * Seerah chapter scene registry — immersive historical environments.
 *
 * Every Seerah chapter (from seerahData.ts) is linked to one distinct scene
 * configuration: its own lighting palette, environment textures, atmosphere
 * layer, weather treatment and atlas campaign (when the chapter covers a
 * documented geographic event).
 *
 * These are *visual scene settings only*. Historical records remain in
 * `client/src/data/seerahData.ts` and `client/src/data/seerah/*.ts`; this
 * registry never duplicates historical facts — it references canonical
 * chapter IDs and existing `art` / `LIVING_CAMPAIGNS` assets.
 *
 * Honesty contract:
 * - No prophetic depiction anywhere.
 * - Environmental textures suggest place and period only; they are not
 *   archaeological reconstructions.
 * - Approximate geographic markers stay labeled approximate.
 * - Every record stays `pending_review` until scholarly sign-off.
 */

import { art } from "@/visual-golden/mock/art";
import { LIVING_CAMPAIGNS } from "@/visual-golden/data/living-atlas";
import type { Weather } from "@/visual-golden/data/living-atlas";
import type { SeerahChapter } from "@/data/seerahData";

/** A distinct visual environment for one chapter era. */
export interface SeerahSceneConfig {
  /** Canonical chapter id from seerahData.ts (must match exactly). */
  chapterId: string;
  /** Display label shown inside the chapter entrance. */
  titleAr: string;
  /** Era name for subtitle. */
  eraAr: string;
  /** Primary lighting palette token (css var name without --). */
  light: "gold-dawn" | "emerald-dusk" | "obsidian-night" | "bronze-day" | "ivory-morning";
  /** Dominant environment texture key (from `art`). */
  plate: keyof typeof art;
  /** Atmosphere treatment (living-atlas weather vocabulary). */
  weather: Weather;
  /** Subtle environmental movement label for audio/motion pairing. */
  movement: "sand" | "wind" | "water" | "stone" | "fabric" | "none";
  /** Linked atlas campaign id when the chapter covers documented geography. */
  atlasCampaignId?: string;
  /** Reconstruction disclosure text (always shown in environment). */
  disclosureAr: string;
}

const SEERAH_SCENES: SeerahSceneConfig[] = [
  {
    chapterId: "birth-and-upbringing",
    titleAr: "المولد والنشأة",
    eraAr: "قبل البعثة — سنة الفيل",
    light: "bronze-day",
    plate: "desert",
    weather: "clear-dawn",
    movement: "wind",
    disclosureAr:
      "مشهد توضيحي للبيئة المحيطة بمكة قبل البعثة، مستند إلى تضاريس الصحراء والجبال — ليس تصويرًا تاريخيًا دقيقًا.",
  },
  {
    chapterId: "prophethood-beginning",
    titleAr: "بدء الوحي",
    eraAr: "بعثة النبي ﷺ",
    light: "obsidian-night",
    plate: "storyHijrah",
    weather: "night-gale",
    movement: "wind",
    disclosureAr:
      "مشهد ليلي تفاعلي لجبل حراء والليل الهادئ، توضيحي بيئي وليس تصويرًا للوحي نفسه.",
  },
  {
    chapterId: "secret-public-dawah",
    titleAr: "الدعوة السرية ثم العلنية",
    eraAr: "مكة — الدعوة والصبر",
    light: "gold-dawn",
    plate: "kaaba",
    weather: "dust-afternoon",
    movement: "sand",
    atlasCampaignId: undefined,
    disclosureAr:
      "مشهد بصري مقترح لمكة في فترة الدعوة المبكرة، مبني على وصف البيئة الصحراوية والمعابد المحيطة — تخطيطي وليس دقيقًا.",
  },
  {
    chapterId: "hijra-to-madinah",
    titleAr: "الهجرة إلى المدينة",
    eraAr: "الهجرة — السنة 13 من البعثة",
    light: "emerald-dusk",
    plate: "storyHijrah",
    weather: "dust-afternoon",
    movement: "sand",
    atlasCampaignId: undefined,
    disclosureAr:
      "مشهد بيئي مقترح لطريق الهجرة، صحراء وجبال وعلامات جغرافية تخطيطية — ليس مسارًا جغرافيًا مثبتًا.",
  },
  {
    chapterId: "establishing-state",
    titleAr: "إقامة الدولة",
    eraAr: "المدينة — التأسيس",
    light: "ivory-morning",
    plate: "mosque",
    weather: "clear-dawn",
    movement: "water",
    disclosureAr:
      "مشهد توضيحي للمسجد النبوي في أول أيام المدينة، مستند إلى وصف السقيفة والبساطة الأولى — ليس أثرًا أثريًا.",
  },
  {
    chapterId: "battles-conquests",
    titleAr: "الغزوات والفتوحات",
    eraAr: "المدينة — الدفاع والغزوات",
    light: "bronze-day",
    plate: "desert",
    weather: "dust-afternoon",
    movement: "sand",
    atlasCampaignId: "badr",
    disclosureAr:
      "مشهد بيئي لغزوة بدر، صحراء مفتوحة وموقع بئر وقضية قرآنية — التضاريس تخطيطية وليست مساحية.",
  },
  {
    chapterId: "farewell-hajj",
    titleAr: "حجة الوداع",
    eraAr: "المدينة — الوداع والوفاة",
    light: "obsidian-night",
    plate: "kaaba",
    weather: "lamps-approach",
    movement: "stone",
    atlasCampaignId: "fath",
    disclosureAr:
      "مشهد ليلي مقترح للكعبة في الليل، مستند إلى وصف المسجد الحرام — ليس تصويرًا للحج نفسه.",
  },
  {
    chapterId: "prophet-death",
    titleAr: "الوفاة والدفن",
    eraAr: "السنة 11 هـ — 632م",
    light: "obsidian-night",
    plate: "reciterDome",
    weather: "night-gale",
    movement: "stone",
    disclosureAr:
      "مشهد تأملي في المدينة المنورة ليلًا، قباب وأضواء بعيدة، وتواضع في العرض احترامًا للمقام.",
  },
];

/** Resolve scene config by chapter id. Returns null when no scene is defined. */
export function getSeerahScene(chapterId: string): SeerahSceneConfig | null {
  return SEERAH_SCENES.find((scene) => scene.chapterId === chapterId) ?? null;
}

/** All scenes in canonical chapter order. */
export function listSeerahScenes(): SeerahSceneConfig[] {
  return [...SEERAH_SCENES];
}

/** Map chapter id to an atlas campaign if the chapter covers documented geography. */
export function sceneAtlasCampaign(chapterId: string): string | null {
  const scene = getSeerahScene(chapterId);
  return scene?.atlasCampaignId ?? null;
}

/** Find a living atlas campaign by id. */
export function findCampaign(id: string): (typeof LIVING_CAMPAIGNS)[number] | null {
  return LIVING_CAMPAIGNS.find((c) => c.id === id) ?? null;
}
