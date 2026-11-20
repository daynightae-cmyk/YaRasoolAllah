/**
 * Seerah Ghazawat scene registry — immersive battle environments.
 *
 * Every documented Ghazwah in the Seerah database is linked to one distinct
 * scene configuration: its own lighting palette, environment texture,
 * atmosphere treatment, movement layer, and — where a Living Atlas campaign
 * exists — an atlas campaign id for geographic exploration.
 *
 * These are *visual scene settings only*. Historical records remain in
 * `client/src/data/seerah/events-madinah.ts`. This registry never duplicates
 * historical facts — it references canonical event IDs and existing
 * `art` / `LIVING_CAMPAIGNS` assets.
 *
 * Honesty contract:
 * - No prophetic depiction, no combatants, no gore, no playable killing.
 * - Troop movement is represented only by abstract markers/lines where the
 *   Living Atlas campaign provides an overlay; otherwise the environment is
 *   explicitly illustrative.
 * - Approximate geographic markers stay labeled approximate.
 * - Every event record stays `pending_review` until scholarly sign-off.
 */

import { art } from "@/visual-golden/mock/art";
import { LIVING_CAMPAIGNS } from "@/visual-golden/data/living-atlas";
import type { Weather } from "@/visual-golden/data/living-atlas";

/** A distinct visual environment for one Ghazwah event. */
export interface GhazawatSceneConfig {
  /** Canonical event id from events-madinah.ts (must match exactly). */
  eventId: string;
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
  /** Linked atlas campaign id when documented geography exists. */
  atlasCampaignId?: string;
  /** Reconstruction disclosure text (always shown in environment). */
  disclosureAr: string;
}

const GHAZAWAT_SCENES: GhazawatSceneConfig[] = [
  {
    eventId: "badr",
    titleAr: "غزوة بدر",
    eraAr: "رمضان ٢ هـ — يوم الفرقان",
    light: "emerald-dusk",
    plate: "sceneBadr",
    weather: "rain-afterglow",
    movement: "sand",
    atlasCampaignId: "badr",
    disclosureAr:
      "مشهد توضيحي لوادي بدر والماء والمطر — علامات تعليمية تخطيطية، ليست ساحة قتال معاد تمثيلها.",
  },
  {
    eventId: "uhud",
    titleAr: "غزوة أحد",
    eraAr: "شوال ٣ هـ — الجبل والصبر",
    light: "bronze-day",
    plate: "sceneUhud",
    weather: "granite-shadow",
    movement: "wind",
    atlasCampaignId: "uhud",
    disclosureAr:
      "مشهد توضيحي لجبل أحد والصخور المحيطة — بيئة جبلية تشرح علاقة الخبر بالمكان، بلا تجسيد لشخصيات.",
  },
  {
    eventId: "khandaq",
    titleAr: "غزوة الخندق",
    eraAr: "شوال ٥ هـ — الحفر والصبر",
    light: "obsidian-night",
    plate: "sceneKhandaq",
    weather: "frost-wind",
    movement: "wind",
    atlasCampaignId: "khandaq",
    disclosureAr:
      "مشهد توضيحي للخندق والريح والليل — علامات تخطيطية تعليمية، ليست مسحًا أثريًا للخندق.",
  },
  {
    eventId: "khaybar",
    titleAr: "غزوة خيبر",
    eraAr: "المحرم ٧ هـ — الحصون والتضاريس",
    light: "bronze-day",
    plate: "sceneKhaybar",
    weather: "dust-afternoon",
    movement: "sand",
    disclosureAr:
      "مشهد بيئي توضيحي لتلال خيبر وأبراجها الحجرية العامة — لا حملة أطلسية موثقة لهذا الحدث، لذلك تكون العلامة تخطيطية فقط.",
  },
  {
    eventId: "mecca-conquest",
    titleAr: "فتح مكة",
    eraAr: "رمضان ٨ هـ — الفتح والأمان",
    light: "gold-dawn",
    plate: "sceneFath",
    weather: "lamps-approach",
    movement: "stone",
    atlasCampaignId: "fath",
    disclosureAr:
      "مشهد ليلي توضيحي لمكة والكعبة في الفتح — أجواء عامة للتأمل، لا تصويرًا للأحداث العسكرية.",
  },
  {
    eventId: "hunayn",
    titleAr: "غزوة حنين",
    eraAr: "شوال ٨ هـ — الوادي والجبال",
    light: "emerald-dusk",
    plate: "sceneHunayn",
    weather: "dust-afternoon",
    movement: "wind",
    disclosureAr:
      "مشهد توضيحي لوادٍ جبلي ضيق يحاكي وصف وادي حنين — لا بيانات جغرافية دقيقة متاحة، لذلك العلامة توضيحية.",
  },
  {
    eventId: "tabuk",
    titleAr: "غزوة تبوك",
    eraAr: "رجب ٩ هـ — الحر والمسافة",
    light: "bronze-day",
    plate: "sceneTabuk",
    weather: "dust-afternoon",
    movement: "sand",
    disclosureAr:
      "مشهد بيئي توضيحي لصحراء مفتوحة تحاكي مسافة تبوك وحرارتها — لا حملة أطلسية موثقة، لذلك العلامة تخطيطية فقط.",
  },
];

/** Resolve ghazawat scene config by event id. Returns null when undefined. */
export function getGhazawatScene(eventId: string): GhazawatSceneConfig | null {
  return GHAZAWAT_SCENES.find((scene) => scene.eventId === eventId) ?? null;
}

/** All ghazawat scenes in canonical order. */
export function listGhazawatScenes(): GhazawatSceneConfig[] {
  return [...GHAZAWAT_SCENES];
}

/** Map event id to an atlas campaign id when documented geography exists. */
export function ghazawatAtlasCampaign(eventId: string): string | null {
  const scene = getGhazawatScene(eventId);
  return scene?.atlasCampaignId ?? null;
}

/** Find a living atlas campaign by id. */
export function findGhazawatCampaign(id: string): (typeof LIVING_CAMPAIGNS)[number] | null {
  return LIVING_CAMPAIGNS.find((c) => c.id === id) ?? null;
}
