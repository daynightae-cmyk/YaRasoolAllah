import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { QuranChapter } from "../client/src/services/quranService";
import {
  QURAN_TEXT_SOURCE_ID,
  buildLocalIndex,
  quranSearchRecords,
  surahRecords,
} from "../client/src/visual-golden/services/basirah";
import {
  DIRECT_READER_MAX_BYTES,
  getEligibleDirectOpenItiVersions,
  getPinnedOpenItiRawUrl,
  isDirectOpenItiReaderEligible,
  isDirectReaderWithinBudget,
  resolveEligibleDirectOpenItiVersions,
  resolveGovernedDirectOpenItiTarget,
} from "../client/src/visual-golden/services/direct-book-reader";
import { TAFSIR_WORKS } from "../client/src/visual-golden/services/tafsir";
import {
  canReadTextInside,
  getGovernedReaderVersion,
  type CatalogPayload,
} from "../client/src/visual-golden/services/catalog-library";
import { evaluateResourceUsage } from "../shared/source-governance";
import {
  digitalVersionRegistry,
  getProviderAvailabilityMetrics,
  OPENITI_RELEASE_COMMIT,
  providerPolicyRegistry,
  workRegistry,
} from "../shared/knowledge-registry";
import {
  OpenItiReaderBudgetError,
  readBoundedUtf8,
} from "../shared/openiti-reader-policy";
import {
  providerResourceRegistry,
  rightsLedger,
  sourceRegistry,
} from "../shared/source-registry";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATE_TANZIL_SOURCE_ID = "src-tanzil-uthmani-1-1-candidate";

const catalog = JSON.parse(
  readFileSync(
    join(repoRoot, "client/public/data/library-catalog.v1.json"),
    "utf8",
  ),
) as CatalogPayload;

const chapter: QuranChapter = {
  number: 1,
  name: "الفاتحة",
  arabicName: "الفاتحة",
  englishName: "Al-Fatihah",
  ayahCount: 7,
  revelationType: "meccan",
};

describe("Basirah Quran evidence uses the governed acquired Tanzil source", () => {
  it("derives the acquired source ID from the production-cleared resource", () => {
    const resource = providerResourceRegistry.find(
      (item) => item.resourceId === "resource-tanzil-uthmani-min-1-1",
    );
    assert.ok(resource, "the governed Tanzil resource must exist");
    assert.equal(resource.sourceId, QURAN_TEXT_SOURCE_ID);
    assert.equal(
      QURAN_TEXT_SOURCE_ID,
      "src-tanzil-uthmani-min-1-1-acquired",
    );
    assert.equal(resource.productionReady, true);
    assert.equal(resource.acquisitionStatus, "acquired_immutable");

    const source = sourceRegistry.find(
      (item) => item.sourceId === resource.sourceId,
    );
    assert.equal(source?.editorialStatus, "verified");

    const rights = rightsLedger.find((item) => item.rightsId === resource.rightsId);
    assert.equal(rights?.decision, "cleared");
  });

  it("never cites the rights-review candidate as Quran evidence", () => {
    const evidence = [
      ...surahRecords([chapter]),
      ...quranSearchRecords([
        {
          surah: 1,
          ayah: 1,
          surahName: "الفاتحة",
          arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        },
      ]),
    ];

    assert.equal(evidence.length, 2);
    for (const record of evidence) {
      assert.deepEqual(record.sourceIds, [QURAN_TEXT_SOURCE_ID]);
      assert.equal(
        record.sourceIds.includes(CANDIDATE_TANZIL_SOURCE_ID),
        false,
      );
    }
  });
  it("keeps the unacquired Tanzil candidate pending and forbidden in production", () => {
    const candidate = providerResourceRegistry.find(
      (item) => item.resourceId === "resource-tanzil-uthmani-1-1-candidate",
    );
    assert.ok(candidate, "the candidate resource must remain registered");
    assert.equal(candidate.sourceId, CANDIDATE_TANZIL_SOURCE_ID);
    assert.equal(candidate.acquisitionStatus, "candidate");
    assert.equal(candidate.productionReady, false);
    assert.deepEqual(candidate.allowedUsages, []);

    const source = sourceRegistry.find(
      (item) => item.sourceId === CANDIDATE_TANZIL_SOURCE_ID,
    );
    assert.equal(source?.editorialStatus, "rights_review_pending");

    const rights = rightsLedger.find(
      (item) => item.rightsId === candidate.rightsId,
    );
    assert.ok(rights);
    assert.equal(rights.decision, "needs_review");
    assert.equal(rights.permissions.apiAccess, "forbidden");
    assert.equal(rights.permissions.streaming, "forbidden");

    for (const usage of ["api_access", "cache", "streaming", "full_text"] as const) {
      assert.equal(
        evaluateResourceUsage(candidate, rights, usage, "production").allowed,
        false,
        `the candidate must not expose ${usage} in production`,
      );
    }
  });
});

describe("Basirah local records do not imply source approval", () => {
  it("keeps the unlinked Seerah chapter explicitly unapproved", () => {
    const chapterRecord = buildLocalIndex().find(
      (record) => record.scope === "seerah",
    );
    assert.ok(chapterRecord);
    assert.deepEqual(chapterRecord.sourceIds, []);
    assert.doesNotMatch(chapterRecord.availabilityAr, /المصدر المعتمد/);
    assert.match(chapterRecord.availabilityAr, /لم يُربط/);
  });
});

describe("direct OpenITI reading has a strict two-field eligibility gate", () => {
  it("resolves an eligible version by registry work ID or OpenITI URI", () => {
    const byWorkId = resolveEligibleDirectOpenItiVersions({
      workId: "work-tabari-tafsir",
    });
    assert.equal(byWorkId.length, 1);
    assert.equal(byWorkId[0].versionId, "version-0310Tabari.JamicBayan.JK000164-ara1");

    const byWorkUri = resolveEligibleDirectOpenItiVersions({
      openitiUri: "0310Tabari.JamicBayan",
    });
    assert.deepEqual(
      byWorkUri.map((version) => version.versionId),
      byWorkId.map((version) => version.versionId),
    );

    const byVersionUri = resolveEligibleDirectOpenItiVersions({
      openitiUri: "0310Tabari.JamicBayan.JK000164-ara1",
    });
    assert.deepEqual(
      byVersionUri.map((version) => version.versionId),
      byWorkId.map((version) => version.versionId),
    );

    const target = resolveGovernedDirectOpenItiTarget({
      openitiUri: "0310Tabari.JamicBayan",
    });
    assert.ok(target);
    assert.equal(target.work.workId, "work-tabari-tafsir");
    const rawUrl = getPinnedOpenItiRawUrl(target.version);
    assert.ok(rawUrl);
    assert.match(
      rawUrl,
      /^https:\/\/raw\.githubusercontent\.com\/OpenITI\/RELEASE\/[a-f0-9]{40}\//,
    );
    assert.ok(!rawUrl.includes("/v2025.1.9/"), "the reader must not use a floating tag");
  });

  it("fails closed for mismatched, missing, or uncleared identities", () => {
    assert.deepEqual(
      resolveEligibleDirectOpenItiVersions({
        workId: "work-tabari-tafsir",
        openitiUri: "0310Tabari.Tarikh",
      }),
      [],
    );
    assert.deepEqual(
      resolveEligibleDirectOpenItiVersions({ openitiUri: "not-a-governed-work" }),
      [],
    );
    const [version] = getEligibleDirectOpenItiVersions("work-tabari-tafsir");
    assert.ok(version);
    assert.equal(
      getPinnedOpenItiRawUrl({
        ...version,
        contentAvailability: "catalog_only",
      }),
      null,
    );
    assert.equal(
      getPinnedOpenItiRawUrl({
        ...version,
        rightsState: "catalog_metadata_only_full_text_needs_version_review",
      }),
      null,
    );
  });

  it("requires both full-text availability and the matching rights clearance", () => {
    const [version] = getEligibleDirectOpenItiVersions("work-tabari-tafsir");
    assert.ok(version, "the registry must contain an eligible tafsir version");
    assert.equal(isDirectOpenItiReaderEligible(version), true);

    assert.equal(
      isDirectOpenItiReaderEligible({
        ...version,
        contentAvailability: "catalog_only",
      }),
      false,
      "full-text availability alone must not open the reader",
    );
    assert.equal(
      isDirectOpenItiReaderEligible({
        ...version,
        rightsState: "catalog_metadata_only_full_text_needs_version_review",
      }),
      false,
      "rights clearance alone must not open the reader",
    );
    assert.equal(
      isDirectReaderWithinBudget({
        ...version,
        artifactBytes: DIRECT_READER_MAX_BYTES + 1,
      }),
      false,
      "an artifact above the reader budget must fail closed",
    );
  });
});

describe("the pinned OpenITI artifacts are measured and bounded", () => {
  it("uses the real suffixed filenames for the Bayhaqi and Bukhari artifacts", () => {
    const bayhaqi = digitalVersionRegistry.find(
      (version) => version.workId === "work-bayhaqi-dalail",
    );
    assert.equal(
      bayhaqi?.artifactPath,
      "data/0458Bayhaqi/0458Bayhaqi.DalailNubuwwa/0458Bayhaqi.DalailNubuwwa.JK006838-ara1.mARkdown",
    );
    const bukhari = digitalVersionRegistry.find(
      (version) => version.workId === "work-bukhari-sahih",
    );
    assert.equal(
      bukhari?.artifactPath,
      "data/0256Bukhari/0256Bukhari.Sahih/0256Bukhari.Sahih.JK000110-ara1.completed",
    );
  });

  it("records a verified decoded size for every governed artifact", () => {
    for (const version of digitalVersionRegistry) {
      assert.ok(
        Number.isInteger(version.artifactBytes) && version.artifactBytes > 0,
        `${version.versionId} needs a measured decoded byte size`,
      );
      assert.equal(
        isDirectReaderWithinBudget(version),
        true,
        `${version.versionId} must fit the reader budget`,
      );
    }
  });

  it("sizes the budget to the largest audited artifact without unbounded loads", () => {
    const largest = [...digitalVersionRegistry].sort(
      (left, right) => right.artifactBytes - left.artifactBytes,
    )[0];
    assert.equal(
      largest.versionId,
      "version-0427AbuIshaqThaclabi.KashfWaBayan.Sham19Y0018686-ara1",
    );
    assert.equal(largest.artifactBytes, 33_451_839);
    assert.ok(largest.artifactBytes < DIRECT_READER_MAX_BYTES);
    assert.ok(
      DIRECT_READER_MAX_BYTES <= 32 * 1024 * 1024,
      "the budget must stay phone-conscious",
    );
  });

  it("pins every governed artifact URL to the immutable release", () => {
    for (const version of digitalVersionRegistry) {
      const rawUrl = getPinnedOpenItiRawUrl(version);
      assert.ok(rawUrl);
      assert.match(rawUrl, new RegExp(`/${OPENITI_RELEASE_COMMIT}/`));
      assert.doesNotMatch(rawUrl, /\/v2025/);
    }
  });

  it("cancels a stream that crosses the decoded-byte budget", async () => {
    const chunk = new TextEncoder().encode("ا".repeat(64));
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(chunk);
        controller.enqueue(chunk);
        controller.close();
      },
    });

    await assert.rejects(
      () =>
        readBoundedUtf8(
          { body: stream, text: async () => "" },
          chunk.byteLength + 1,
        ),
      OpenItiReaderBudgetError,
    );
  });

  it("decodes a stream that stays inside the budget", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("نص"));
        controller.close();
      },
    });
    const text = await readBoundedUtf8(
      { body: stream, text: async () => "" },
      1024,
    );
    assert.equal(text, "نص");
  });

  it("does not tell readers that an eligible work's text is unavailable", () => {
    const eligibleWorkIds = new Set(
      getEligibleDirectOpenItiVersions().map((version) => version.workId),
    );
    const contradiction =
      /لا يُعرض النص الكامل|فهرسة فقط|لا تُعرض قراءة داخلية/;
    for (const work of workRegistry) {
      if (!eligibleWorkIds.has(work.workId)) continue;
      assert.doesNotMatch(
        work.attributionCaveat,
        contradiction,
        `${work.workId} has an eligible version but its caveat denies reading`,
      );
    }
  });
});

describe("the shipped catalog reaches only governed reader versions", () => {
  it("bridges catalog rows to the registry and rejects research-only text flags", () => {
    const readable = catalog.works.filter((work) => canReadTextInside(work));
    assert.ok(readable.length > 0);
    assert.ok(
      readable.length < catalog.works.filter((work) => work.digital).length,
      "an attached catalog text record is not automatically readable",
    );

    const tabari = catalog.works.find(
      (work) => work.openitiUri === "0310Tabari.JamicBayan",
    );
    assert.ok(tabari);
    const governed = getGovernedReaderVersion(tabari);
    assert.ok(governed);
    assert.equal(governed.versionId, "version-0310Tabari.JamicBayan.JK000164-ara1");
    assert.equal(governed.contentAvailability, "full_text_cleared");
    assert.equal(
      governed.rightsState,
      "cleared_public_domain_openiti_historical_text",
    );

    const researchOnly = catalog.works.find(
      (work) =>
        work.digital?.reading === "CAN_IMPORT_TEXT"
        && getGovernedReaderVersion(work) === null,
    );
    assert.ok(researchOnly);
    assert.equal(canReadTextInside(researchOnly), false);
  });

  it("keeps the mounted deep-reader on the governed document service", () => {
    const chamber = readFileSync(
      join(
        repoRoot,
        "client/src/visual-golden/components/library/CatalogReadingChamber.tsx",
      ),
      "utf8",
    );
    const page = readFileSync(
      join(repoRoot, "client/src/visual-golden/pages/LibraryPage.tsx"),
      "utf8",
    );
    assert.match(page, /<CatalogReadingChamber/);
    assert.match(page, /canOpenReader=\{canReadTextInside\}/);
    assert.match(chamber, /getGovernedReaderVersion\(work\)/);
    assert.match(chamber, /loadDirectBookDocument/);
    assert.match(chamber, /getPinnedOpenItiRawUrl/);
    assert.doesNotMatch(chamber, /fetch\(work\.digital/);
  });
});

describe("Tafsir availability keeps reading and scholarly review distinct", () => {
  it("reports an eligible work as readable while scholarly review remains pending", () => {
    const readable = TAFSIR_WORKS.filter((item) => item.isReadable);
    assert.ok(readable.length > 0, "at least one tafsir work must be readable");

    for (const item of readable) {
      assert.ok(item.eligibleVersionCount > 0);
      assert.equal(
        getEligibleDirectOpenItiVersions(item.work.workId).length,
        item.eligibleVersionCount,
      );
      assert.equal(
        item.work.scholarlyReviewStatus,
        "scholarly_review_pending",
      );
      assert.match(item.readerPath, /^\/library\/work\//);
    }
  });

  it("mirrors eligible tafsir availability in the Basirah library index", () => {
    const record = buildLocalIndex().find(
      (item) => item.id === "work-work-tabari-tafsir",
    );
    assert.ok(record, "the eligible tafsir work must appear in Basirah");
    assert.match(record.availabilityAr, /متاح للقراءة/);
    assert.doesNotMatch(record.availabilityAr, /غير متاح/);
    assert.match(record.certaintyReasonAr, /المراجعة العلمية/);
    assert.match(record.certaintyReasonAr, /مراجعة الطبعة/);
  });
});

describe("Sources availability metrics classify each provider exactly once", () => {
  it("keeps full text, streaming, catalog, external, and API states distinct", () => {
    const metrics = getProviderAvailabilityMetrics();
    const availabilityTotal =
      metrics.fullTextCleared +
      metrics.streamingCleared +
      metrics.catalogOnly +
      metrics.externalLinkOnly +
      metrics.apiOnly;

    assert.equal(availabilityTotal, providerPolicyRegistry.length);
    assert.equal(
      metrics.fullTextCleared,
      providerPolicyRegistry.filter(
        (provider) =>
          provider.rightsState !== "api_only" &&
          provider.contentAvailability === "full_text_cleared",
      ).length,
    );
    assert.equal(
      metrics.streamingCleared,
      providerPolicyRegistry.filter(
        (provider) =>
          provider.rightsState !== "api_only" &&
          provider.contentAvailability === "streaming_cleared",
      ).length,
    );
    assert.equal(
      metrics.catalogOnly,
      providerPolicyRegistry.filter(
        (provider) =>
          provider.rightsState !== "api_only" &&
          provider.contentAvailability === "catalog_only",
      ).length,
    );
    assert.equal(
      metrics.externalLinkOnly,
      providerPolicyRegistry.filter(
        (provider) =>
          provider.rightsState !== "api_only" &&
          provider.contentAvailability === "external_link_only",
      ).length,
    );
    assert.equal(
      metrics.apiOnly,
      providerPolicyRegistry.filter(
        (provider) => provider.rightsState === "api_only",
      ).length,
    );

    assert.ok(metrics.fullTextCleared > 0);
    assert.ok(metrics.streamingCleared > 0);
    assert.ok(metrics.catalogOnly > 0);
    assert.ok(metrics.externalLinkOnly > 0);
    assert.ok(metrics.apiOnly > 0);
  });

  it("reports credential and rights-review overlays separately", () => {
    const metrics = getProviderAvailabilityMetrics();
    assert.equal(
      metrics.credentialsRequired,
      providerPolicyRegistry.filter((provider) => provider.credentialsRequired)
        .length,
    );
    assert.equal(
      metrics.rightsReviewPending,
      providerPolicyRegistry.filter((provider) =>
        ["needs_license_review", "item_by_item_review"].includes(
          provider.rightsState,
        ),
      ).length,
    );

    const sourcesPage = readFileSync(
      join(repoRoot, "client/src/pages/SourcesPage.tsx"),
      "utf8",
    );
    assert.match(sourcesPage, /getProviderAvailabilityMetrics\(\)/);
    assert.doesNotMatch(sourcesPage, /externalOnlyCount/);
  });
});
