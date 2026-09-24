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

export const KIDS_COUNTS = {
  adaptations: childrenAdaptationRegistry.length,
  clearedMedia: mediaAssetRegistry.length,
};

export function ageBandLabel(ageBand: ChildrenAdaptationRecord["ageBand"]): string {
  return `${ageBand} سنوات`;
}
