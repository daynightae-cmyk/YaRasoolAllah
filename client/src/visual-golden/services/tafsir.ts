import {
  digitalVersionRegistry,
  workRegistry,
  type DigitalVersionRecord,
  type WorkRecord,
} from "@shared/knowledge-registry";
import { getEligibleDirectOpenItiVersions } from "@/visual-golden/services/direct-book-reader";

export interface TafsirWork {
  work: WorkRecord;
  versions: DigitalVersionRecord[];
  versionCount: number;
  eligibleVersions: DigitalVersionRecord[];
  eligibleVersionCount: number;
  isReadable: boolean;
  readerPath: string;
}

export const TAFSIR_WORKS: TafsirWork[] = workRegistry
  .filter((record) => record.category === "tafsir")
  .map((work) => {
    const versions = digitalVersionRegistry.filter((version) => version.workId === work.workId);
    const eligibleVersions = getEligibleDirectOpenItiVersions(work.workId);
    return {
      work,
      versions,
      versionCount: versions.length,
      eligibleVersions,
      eligibleVersionCount: eligibleVersions.length,
      isReadable: eligibleVersions.length > 0,
      readerPath: `/library/work/${encodeURIComponent(work.workId)}`,
    };
  });

export const TAFSIR_COUNTS = {
  works: TAFSIR_WORKS.length,
  versions: TAFSIR_WORKS.reduce((sum, item) => sum + item.versionCount, 0),
  readableWorks: TAFSIR_WORKS.filter((item) => item.isReadable).length,
};
