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
  /** LivingSeerahWorld scene id to enter from this chapter's Play/Enter. */
  worldSceneId: string;
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
    worldSceneId: "desert-camp",
    titleAr: "المولد والنشأة",
    eraAr: "قبل البعثة — سنة الفيل",
    light: "bronze-day",
    plate: "sceneMakkah",
    weather: "clear-dawn",
    movement: "wind",
    disclosureAr:
      "مشهد توضيحي للبيئة المحيطة بمكة قبل البعثة، مستند إلى تضاريس الصحراء والجبال — ليس تصويرًا تاريخيًا دقيقًا.",
  },
  {
    chapterId: "prophethood-beginning",
    worldSceneId: "hira-cave",
    titleAr: "بدء الوحي",
    eraAr: "بعثة النبي ﷺ",
    light: "obsidian-night",
    plate: "sceneHira",
    weather: "night-gale",
    movement: "wind",
    disclosureAr:
      "مشهد ليلي تفاعلي لجبل حراء والليل الهادئ، توضيحي بيئي وليس تصويرًا للوحي نفسه.",
  },
  {
    chapterId: "secret-public-dawah",
    worldSceneId: "desert-camp",
    titleAr: "الدعوة السرية ثم العلنية",
    eraAr: "مكة — الدعوة والصبر",
    light: "gold-dawn",
    plate: "sceneDawah",
    weather: "dust-afternoon",
    movement: "sand",
    atlasCampaignId: undefined,
    disclosureAr:
      "مشهد توضيحي لممر صخري في وادي مكة عند الشروق، يوحي ببيئة الدعوة الأولى — تخطيطي وليس تحديدًا جغرافيًا دقيقًا.",
  },
  {
    chapterId: "hijra-to-madinah",
    worldSceneId: "madinah-walk",
    titleAr: "الهجرة إلى المدينة",
    eraAr: "الهجرة — السنة 13 من البعثة",
    light: "emerald-dusk",
    plate: "sceneHijrah",
    weather: "dust-afternoon",
    movement: "sand",
    atlasCampaignId: undefined,
    disclosureAr:
      "مشهد بيئي مقترح لطريق الهجرة، صحراء وجبال وعلامات جغرافية تخطيطية — ليس مسارًا جغرافيًا مثبتًا.",
  },
  {
    chapterId: "establishing-state",
    worldSceneId: "madinah-walk",
    titleAr: "إقامة الدولة",
    eraAr: "المدينة — التأسيس",
    light: "ivory-morning",
    plate: "sceneMadinah",
    weather: "clear-dawn",
    movement: "water",
    disclosureAr:
      "مشهد توضيحي للمسجد النبوي في أول أيام المدينة، مستند إلى وصف السقيفة والبساطة الأولى — ليس أثرًا أثريًا.",
  },
  {
    chapterId: "battles-conquests",
    worldSceneId: "badr-valley",
    titleAr: "الغزوات والفتوحات",
    eraAr: "المدينة — الدفاع والغزوات",
    light: "bronze-day",
    plate: "sceneBadr",
    weather: "dust-afternoon",
    movement: "sand",
    atlasCampaignId: "badr",
    disclosureAr:
      "مشهد افتتاحي للفصل من وادي بدر؛ ولكل غزوة داخل الفصل مشهدها المستقل. التضاريس تخطيطية وليست مساحية.",
  },
  {
    chapterId: "farewell-hajj",
    worldSceneId: "desert-camp",
    titleAr: "حجة الوداع",
    eraAr: "مكة — الحج والوداع",
    light: "gold-dawn",
    plate: "sceneHajj",
    weather: "lamps-approach",
    movement: "stone",
    atlasCampaignId: "fath",
    disclosureAr:
      "مشهد توضيحي لسهل مفتوح عند الفجر، يوحي باتساع الطريق لا بتفاصيل المناسك — ليس تصويرًا للحج ولا تحديدًا جغرافيًا دقيقًا.",
  },
  {
    chapterId: "prophet-death",
    worldSceneId: "desert-camp",
    titleAr: "الوفاة والدفن",
    eraAr: "السنة 11 هـ — 632م",
    light: "obsidian-night",
    plate: "sceneFarewell",
    weather: "night-gale",
    movement: "stone",
    disclosureAr:
      "مشهد تأملي لبستان نخيل وأضواء بعيدة في المدينة ليلًا، بلا أي تجسيد بشري، وتواضع في العرض احترامًا للمقام.",
  },
];

/** Resolve scene config by chapter id. Returns null when no scene is defined. */
export function getSeerahScene(chapterId: string): SeerahSceneConfig | null {
  return SEERAH_SCENES.find((scene) => scene.chapterId === chapterId) ?? null;
}

/** Resolve the LivingSeerahWorld scene id for a chapter's Play/Enter. */
export function getWorldSceneIdForChapter(chapterId: string): string | null {
  const scene = SEERAH_SCENES.find((s) => s.chapterId === chapterId);
  return scene?.worldSceneId ?? null;
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
