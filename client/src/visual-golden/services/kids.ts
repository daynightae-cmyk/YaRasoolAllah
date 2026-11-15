import { art } from "@/visual-golden/mock/art";
import {
  childrenAdaptationRegistry,
  mediaAssetRegistry,
  type ChildrenAdaptationRecord,
} from "@shared/knowledge-registry";

export interface KidsStory extends ChildrenAdaptationRecord {
  img: string;
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
