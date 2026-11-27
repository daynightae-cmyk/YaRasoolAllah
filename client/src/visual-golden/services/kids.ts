import { art } from "@/visual-golden/mock/art";
import {
  childrenAdaptationRegistry,
  mediaAssetRegistry,
  workRegistry,
  type ChildrenAdaptationRecord,
} from "@shared/knowledge-registry";
import { sourceRegistry } from "@shared/source-registry";

export interface KidsStory extends ChildrenAdaptationRecord {
  img: string;
}

export interface KidsAdaptationSource {
  sourceId: string;
  titleAr: string;
}

const ART_BY_AGE: Record<ChildrenAdaptationRecord["ageBand"], string> = {
  "6-8": art.storyReading,
  "9-12": art.storyHijrah,
  "13-15": art.storyCamel,
};

const ART_FALLBACK = [art.storyReading, art.storyHijrah, art.storyCamel, art.storyAnimals, art.kidsRead];

export const KIDS_STORIES: KidsStory[] = childrenAdaptationRegistry.map((adaptation, index) => ({
  ...adaptation,
  img: ART_BY_AGE[adaptation.ageBand] ?? ART_FALLBACK[index % ART_FALLBACK.length],
}));

const REGISTERED_ADAPTATION_IDS = new Set(KIDS_STORIES.map((story) => story.adaptationId));

export const KIDS_COUNTS = {
  adaptations: childrenAdaptationRegistry.length,
  clearedMedia: mediaAssetRegistry.length,
};

export function isRegisteredKidsAdaptationId(adaptationId: string): boolean {
  return REGISTERED_ADAPTATION_IDS.has(adaptationId);
}

export function countDistinctSeenKidsAdaptations(seenAdaptationIds: readonly string[]): number {
  const distinctRegisteredIds = new Set<string>();
  for (const adaptationId of seenAdaptationIds) {
    if (isRegisteredKidsAdaptationId(adaptationId)) distinctRegisteredIds.add(adaptationId);
  }
  return distinctRegisteredIds.size;
}

export function hasThreeStoryKidsBadge(seenAdaptationIds: readonly string[]): boolean {
  return countDistinctSeenKidsAdaptations(seenAdaptationIds) >= 3;
}

export function shouldCountColoringSession(hasInteracted: boolean, alreadyCounted: boolean): boolean {
  return hasInteracted && !alreadyCounted;
}

export function ageBandLabel(ageBand: ChildrenAdaptationRecord["ageBand"]): string {
  return `${ageBand} سنوات`;
}

const KIDS_REVIEW_STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  editorial_review_pending: "مراجعة تحريرية معلّقة",
  scholarly_review_pending: "مراجعة علمية معلّقة",
};

export function kidsReviewStatusLabel(status: string | null | undefined): string {
  if (!status) return "قيد المراجعة";
  return KIDS_REVIEW_STATUS_LABELS[status] ?? status;
}

/**
 * Resolve every source id of an adaptation to a human-readable title.
 *
 * The id itself is always kept visible: a parent-facing panel must never hide
 * the identifier that makes the claim checkable in the source registry.
 */
export function kidsAdaptationSources(
  adaptation: ChildrenAdaptationRecord,
): KidsAdaptationSource[] {
  return adaptation.sourceIds.map((sourceId) => ({
    sourceId,
    titleAr:
      workRegistry.find((work) => work.workId === sourceId)?.titleAr ??
      sourceRegistry.find((source) => source.sourceId === sourceId)?.title ??
      sourceId,
  }));
}

export function kidsAdaptationPosition(
  adaptationId: string,
  adaptations: readonly ChildrenAdaptationRecord[] = childrenAdaptationRegistry,
): { index: number; total: number } {
  const index = adaptations.findIndex((item) => item.adaptationId === adaptationId);
  return { index, total: adaptations.length };
}

// ---------------------------------------------------------------------------
// Topic architecture: the twelve governed experiences of the Children's
// World. Every registered adaptation belongs to exactly one topic; topics
// may additionally point at a kids-video row topic or a local activity.
// ---------------------------------------------------------------------------

export type KidsTopicId =
  | "prophets-stories"
  | "quran-stories"
  | "seerah-kids"
  | "islamic-tales"
  | "prayer"
  | "wudu"
  | "quran-memorization"
  | "adhkar"
  | "manners"
  | "arabic-language"
  | "activities"
  | "quizzes";

export interface KidsTopic {
  id: KidsTopicId;
  labelAr: string;
  descriptionAr: string;
  adaptationIds: string[];
  videoTopic?: import("./kids-media/types").KidsVideoTopic;
  activity?: "quiz" | "coloring";
}

export const KIDS_TOPICS: KidsTopic[] = [
  {
    id: "prophets-stories",
    labelAr: "قصص الأنبياء",
    descriptionAr: "حكايات الأنبياء بعبرة وعظة، دون تمثيل بصري لأي نبي.",
    adaptationIds: ["adaptation-prophet-nuh-child", "adaptation-prophet-yunus-child"],
    videoTopic: "prophets",
  },
  {
    id: "quran-stories",
    labelAr: "قصص القرآن",
    descriptionAr: "قصص مستوحاة من القرآن الكريم بأسماء السور، دون نسخ نص المصحف.",
    adaptationIds: ["adaptation-quran-stories-child"],
    videoTopic: "quran",
  },
  {
    id: "seerah-kids",
    labelAr: "السيرة النبوية للأطفال",
    descriptionAr: "محطات من السيرة النبوية بلغة تناسب الأطفال، بلا تمثيل بصري.",
    adaptationIds: ["adaptation-seerah-for-kids", "adaptation-hijrah-planning", "adaptation-report-confidence"],
    videoTopic: "seerah",
  },
  {
    id: "islamic-tales",
    labelAr: "الحكايات الإسلامية",
    descriptionAr: "حكايات أصلية تُظهر قيمة أخلاقية في موقف يومي من الحياة.",
    adaptationIds: ["adaptation-truthful-promise", "adaptation-honesty-tale", "adaptation-hospitality-tale"],
    videoTopic: "hadith-stories",
  },
  {
    id: "prayer",
    labelAr: "تعليم الصلاة",
    descriptionAr: "خطوات الصلاة وأوقاتها للأطفال، مع تنبيه ولي الأمر للمراجعة.",
    adaptationIds: ["adaptation-prayer-for-child"],
  },
  {
    id: "wudu",
    labelAr: "تعليم الوضوء",
    descriptionAr: "الوضوء كطهارة قبل الصلاة، بحركات توضيحية بلا شخصيات دينية.",
    adaptationIds: ["adaptation-wudu-for-child"],
  },
  {
    id: "quran-memorization",
    labelAr: "تحفيظ القرآن",
    descriptionAr: "عادات حفظ تدريجية من نص المصحف المعتمد وقواعد التجويد.",
    adaptationIds: ["adaptation-quran-memorization-child"],
    videoTopic: "quran",
  },
  {
    id: "adhkar",
    labelAr: "الأذكار",
    descriptionAr: "الأذكار اليومية المأثورة للأطفال بصيغة مبسطة.",
    adaptationIds: ["adaptation-adhkar-child"],
    videoTopic: "adhkar",
  },
  {
    id: "manners",
    labelAr: "الأخلاق والآداب",
    descriptionAr: "قيم الرحمة والصدق والضيافة في مواقف يومية قريبة من الطفل.",
    adaptationIds: ["adaptation-mercy-at-home"],
    videoTopic: "manners",
  },
  {
    id: "arabic-language",
    labelAr: "الحروف واللغة العربية",
    descriptionAr: "الحروف وأصواتها وأشكالها في أوضاعها المختلفة، بالاستناد إلى كتب النحو والبيان.",
    adaptationIds: ["adaptation-arabic-letters-child"],
    videoTopic: "arabic",
  },
  {
    id: "activities",
    labelAr: "الأنشطة التعليمية",
    descriptionAr: "أنشطة محلية على الجهاز: تلوين وتمارين شفهية.",
    adaptationIds: ["adaptation-source-detective"],
    activity: "coloring",
  },
  {
    id: "quizzes",
    labelAr: "المسابقات",
    descriptionAr: "ألغاز محلية من بيانات السور الحقيقية، تعمل دون اتصال.",
    adaptationIds: [],
    activity: "quiz",
  },
];

const ADAPTATION_TOPIC = new Map<string, KidsTopicId>();
for (const topic of KIDS_TOPICS) {
  for (const adaptationId of topic.adaptationIds) {
    if (ADAPTATION_TOPIC.has(adaptationId)) {
      throw new Error(`adaptation ${adaptationId} is assigned to more than one topic`);
    }
    ADAPTATION_TOPIC.set(adaptationId, topic.id);
  }
}

export function kidsTopicForAdaptation(adaptationId: string): KidsTopic | null {
  const topicId = ADAPTATION_TOPIC.get(adaptationId);
  return KIDS_TOPICS.find((topic) => topic.id === topicId) ?? null;
}

export function kidsAdaptationsForTopic(topicId: KidsTopicId): ChildrenAdaptationRecord[] {
  const topic = KIDS_TOPICS.find((item) => item.id === topicId);
  if (!topic) return [];
  return childrenAdaptationRegistry.filter((item) => topic.adaptationIds.includes(item.adaptationId));
}
