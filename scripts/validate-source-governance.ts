import {
  evaluateResourceUsage,
  providerResourceEntrySchema,
  rightsLedgerEntrySchema,
  sourceRegistryEntrySchema,
} from "../shared/source-governance";
import {
  providerResourceRegistry,
  rightsLedger,
  sourceRegistry,
} from "../shared/source-registry";
import {
  childrenAdaptationRegistry,
  digitalVersionRegistry,
  mediaAssetRegistry,
  OPENITI_RELEASE_COMMIT,
  providerPolicyRegistry,
  workRegistry,
} from "../shared/knowledge-registry";
import {
  HADITH_COLLECTIONS,
  HADITH_DEVELOPMENT_SAMPLES,
} from "../client/src/data/hadithData";

sourceRegistryEntrySchema.array().parse(sourceRegistry);
rightsLedgerEntrySchema.array().parse(rightsLedger);
providerResourceEntrySchema.array().parse(providerResourceRegistry);

function assertUnique(values: string[], label: string) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) throw new Error(`${label} contains duplicate ids: ${duplicates.join(", ")}`);
}

assertUnique(sourceRegistry.map((item) => item.sourceId), "source_registry");
assertUnique(rightsLedger.map((item) => item.rightsId), "rights_ledger");
assertUnique(providerResourceRegistry.map((item) => item.resourceId), "provider_resource_registry");
assertUnique(workRegistry.map((item) => item.workId), "work_registry");
assertUnique(digitalVersionRegistry.map((item) => item.versionId), "digital_version_registry");
assertUnique(providerPolicyRegistry.map((item) => item.providerId), "provider_policy_registry");
assertUnique(childrenAdaptationRegistry.map((item) => item.adaptationId), "children_adaptation_registry");

const knownSourceIds = new Set(sourceRegistry.map((item) => item.sourceId));
const knownWorkIds = new Set(workRegistry.map((item) => item.workId));

for (const work of workRegistry) {
  for (const sourceId of work.sourceIds) {
    if (!knownSourceIds.has(sourceId)) {
      throw new Error(`${work.workId} references missing source ${sourceId}`);
    }
  }
}

for (const version of digitalVersionRegistry) {
  const work = workRegistry.find((item) => item.workId === version.workId);
  if (!work?.openitiWorkUri) {
    throw new Error(`${version.versionId} references a missing OpenITI work`);
  }
  if (!version.openitiUri.startsWith(`${work.openitiWorkUri}.`)) {
    throw new Error(`${version.versionId} does not belong to ${work.openitiWorkUri}`);
  }
  if (version.releaseCommit !== OPENITI_RELEASE_COMMIT) {
    throw new Error(`${version.versionId} is not pinned to the approved OpenITI release`);
  }
  if (version.contentAvailability !== "catalog_only") {
    throw new Error(`${version.versionId} must remain catalog-only pending version rights review`);
  }
  if (!version.sourceUrl.includes(`/blob/${OPENITI_RELEASE_COMMIT}/`)) {
    throw new Error(`${version.versionId} source URL is not commit-pinned`);
  }
  if (version.artifactGitSha !== null && !/^[a-f0-9]{40}$/.test(version.artifactGitSha)) {
    throw new Error(`${version.versionId} has an invalid artifact Git SHA`);
  }
}

for (const item of childrenAdaptationRegistry) {
  for (const sourceId of item.sourceIds) {
    if (!knownSourceIds.has(sourceId) && !knownWorkIds.has(sourceId)) {
      throw new Error(`${item.adaptationId} references missing source/work ${sourceId}`);
    }
  }
  if (item.adaptationLabel !== "platform_original_not_a_direct_quote") {
    throw new Error(`${item.adaptationId} must remain explicitly labelled as an adaptation`);
  }
  if (item.depictionPolicy !== "no_prophetic_depiction") {
    throw new Error(`${item.adaptationId} violates the prophetic depiction policy`);
  }
}

if (mediaAssetRegistry.length !== 0) {
  throw new Error("No media asset may ship before item-level rights clearance is registered");
}

for (const policy of providerPolicyRegistry) {
  if (policy.domain === "audio" && policy.contentAvailability === "full_text_cleared") {
    throw new Error(`${policy.providerId} incorrectly exposes bundled audio`);
  }
  if (policy.rightsState === "needs_credential" && !policy.credentialsRequired) {
    throw new Error(`${policy.providerId} must declare its credential requirement`);
  }
}

for (const collection of HADITH_COLLECTIONS) {
  if (collection.isAvailable) {
    throw new Error(`${collection.id} cannot claim corpus availability without a cleared provider resource`);
  }
}

for (const hadith of HADITH_DEVELOPMENT_SAMPLES) {
  if (hadith.editorialReviewStatus !== "editorial_review_pending") {
    throw new Error(`${hadith.id} must remain editorial-review pending`);
  }
  if (hadith.contentAvailability !== "development_sample") {
    throw new Error(`${hadith.id} must remain a development sample`);
  }
  if (!hadith.gradeSource.trim()) {
    throw new Error(`${hadith.id} is missing a grade source field`);
  }
  if (!("gradeAssessor" in hadith)) {
    throw new Error(`${hadith.id} is missing a separate grade assessor field`);
  }
  if (/طبعة دار|تحقيق أحمد شاكر/.test(hadith.provenance)) {
    throw new Error(`${hadith.id} contains an edition claim without registered edition evidence`);
  }
}

for (const resource of providerResourceRegistry) {
  const source = sourceRegistry.find((item) => item.sourceId === resource.sourceId);
  const rights = rightsLedger.find((item) => item.rightsId === resource.rightsId);
  if (!source) throw new Error(`${resource.resourceId} references a missing source`);
  if (!rights) throw new Error(`${resource.resourceId} references missing rights`);
  if (rights.sourceId !== source.sourceId) {
    throw new Error(`${resource.resourceId} rights do not belong to its source`);
  }

  if (["needs_review", "blocked"].includes(rights.decision) && resource.allowedUsages.length) {
    throw new Error(`${resource.resourceId} exposes usages while rights are ${rights.decision}`);
  }
}

const catalogResource = providerResourceRegistry.find(
  (item) => item.resourceId === "resource-library-development-catalog",
)!;
const catalogRights = rightsLedger.find(
  (item) => item.rightsId === catalogResource.rightsId,
)!;

if (!evaluateResourceUsage(catalogResource, catalogRights, "external_link", "production").allowed) {
  throw new Error("Catalog external-link usage should remain available");
}
if (evaluateResourceUsage(catalogResource, catalogRights, "full_text", "production").allowed) {
  throw new Error("Catalog-only resource must never expose full text");
}

const sampleResource = providerResourceRegistry.find(
  (item) => item.resourceId === "resource-quran-development-sample",
)!;
const sampleRights = rightsLedger.find((item) => item.rightsId === sampleResource.rightsId)!;
if (evaluateResourceUsage(sampleResource, sampleRights, "cache", "production").allowed) {
  throw new Error("Development Quran sample must be blocked in production");
}

const tanzilResource = providerResourceRegistry.find(
  (item) => item.resourceId === "resource-tanzil-uthmani-min-1-1",
)!;
const tanzilRights = rightsLedger.find((item) => item.rightsId === tanzilResource.rightsId)!;
if (!evaluateResourceUsage(tanzilResource, tanzilRights, "full_text", "production").allowed) {
  throw new Error("Cleared Tanzil artifact must expose full text in production");
}

console.log(
  `Source governance PASS: ${sourceRegistry.length} sources, ${rightsLedger.length} rights records, ${providerResourceRegistry.length} provider resources, ${workRegistry.length} works, ${digitalVersionRegistry.length} digital versions, ${providerPolicyRegistry.length} provider policies, ${childrenAdaptationRegistry.length} children adaptations, ${HADITH_DEVELOPMENT_SAMPLES.length} review-pending hadith samples, ${mediaAssetRegistry.length} cleared media assets.`,
);

