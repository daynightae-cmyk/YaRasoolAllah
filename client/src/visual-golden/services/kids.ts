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
