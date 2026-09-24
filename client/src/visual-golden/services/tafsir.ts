import {
  digitalVersionRegistry,
  workRegistry,
  type DigitalVersionRecord,
  type WorkRecord,
} from "@shared/knowledge-registry";

export interface TafsirWork {
  work: WorkRecord;
  versions: DigitalVersionRecord[];
  versionCount: number;
}

export const TAFSIR_WORKS: TafsirWork[] = workRegistry
  .filter((record) => record.category === "tafsir")
  .map((work) => {
    const versions = digitalVersionRegistry.filter((version) => version.workId === work.workId);
    return { work, versions, versionCount: versions.length };
  });

export const TAFSIR_COUNTS = {
  works: TAFSIR_WORKS.length,
  versions: TAFSIR_WORKS.reduce((sum, item) => sum + item.versionCount, 0),
};
