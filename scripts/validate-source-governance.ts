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
  `Source governance PASS: ${sourceRegistry.length} sources, ${rightsLedger.length} rights records, ${providerResourceRegistry.length} provider resources.`,
);

