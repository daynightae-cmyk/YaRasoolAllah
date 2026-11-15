import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const IN = resolve(root, "data-sources/media/discovery/media-discovery-catalog.json");
const MANIFEST = resolve(root, "data-sources/media/discovery/ingestion-manifest.json");
const OUT = resolve(root, "client/src/visual-golden/data/media-discovery.generated.ts");
const STATUS_OUT = resolve(root, "client/src/visual-golden/data/media-discovery-status.generated.ts");

type DiscoveryRecord = {
  id: string;
  provider: string;
  video_id: string | null;
  official_url: string | null;
  title_original: string | null;
  title_ar: string | null;
  description_ar: string | null;
  language: string | null;
  duration_seconds: number | null;
  published_at: string | null;
  channel_id: string | null;
  channel_name: string | null;
  channel_url: string | null;
  publisher_status: string | null;
  series_name: string | null;
  playlist_id: string | null;
  episode_number: number | null;
  category: string | null;
  subcategory: string | null;
  age_band: string | null;
  speaker: string | null;
  content_type: string | null;
  rights_holder: string | null;
  rights_notice: string | null;
  rights_status: string | null;
  license_type: string | null;
  license_evidence_url: string | null;
  attribution_text: string | null;
  embedding_status: string | null;
  embed_url: string | null;
  editorial_status: string | null;
  publication_status: string | null;
  religious_review_status: string | null;
  depiction_review_status: string | null;
  thumbnail_url: string | null;
  thumbnail_rights_status: string | null;
  source_checked_at: string | null;
  verification_method: string | null;
  verification_evidence_urls: string[] | null;
  notes: string | null;
  rights_action: string | null;
  review_reason: string | null;
  review_next_action: string | null;
  provenance: {
    sourceFile: string;
    sourceRow: number;
    inputSha256: string;
  };
};

export type DiscoveryCatalogPayload = {
  schemaVersion: number;
  generatedAt: string;
  policy: string;
  counts: { total: number; approved: number; pending: number };
  records: DiscoveryRecord[];
};

export type DiscoveryManifest = {
  schemaVersion: number;
  generatedAt: string;
  sourcePack: string;
  totalUniqueRecords: number;
  approvedForPublicDisplay: number;
  blockedPendingReview: number;
  rightsUnknown: number;
  outputs?: {
    catalog?: { path: string; sha256: string; bytes: number };
    clientCatalog?: { path: string; sha256: string; bytes: number };
  };
};

function jsString(value: string | null): string {
  return value == null ? "null" : JSON.stringify(value);
}

function jsArray(value: string[] | null): string {
  if (!value) return "null";
  return `[${value.map((item) => JSON.stringify(item)).join(",")}]`;
}

export function buildDiscoveryCatalogModule(data: DiscoveryCatalogPayload): string {
  const records = data.records.map((record) => {
    const fields = [
      `id: ${jsString(record.id)}`,
      `provider: ${jsString(record.provider)}`,
      `video_id: ${jsString(record.video_id)}`,
      `official_url: ${jsString(record.official_url)}`,
      `title_original: ${jsString(record.title_original)}`,
      `title_ar: ${jsString(record.title_ar)}`,
      `description_ar: ${jsString(record.description_ar)}`,
      `language: ${jsString(record.language)}`,
      `duration_seconds: ${record.duration_seconds ?? "null"}`,
      `published_at: ${jsString(record.published_at)}`,
      `channel_id: ${jsString(record.channel_id)}`,
      `channel_name: ${jsString(record.channel_name)}`,
      `channel_url: ${jsString(record.channel_url)}`,
      `publisher_status: ${jsString(record.publisher_status)}`,
      `series_name: ${jsString(record.series_name)}`,
      `playlist_id: ${jsString(record.playlist_id)}`,
      `episode_number: ${record.episode_number ?? "null"}`,
      `category: ${jsString(record.category)}`,
      `subcategory: ${jsString(record.subcategory)}`,
      `age_band: ${jsString(record.age_band)}`,
      `speaker: ${jsString(record.speaker)}`,
      `content_type: ${jsString(record.content_type)}`,
      `rights_holder: ${jsString(record.rights_holder)}`,
      `rights_notice: ${jsString(record.rights_notice)}`,
      `rights_status: ${jsString(record.rights_status)}`,
      `license_type: ${jsString(record.license_type)}`,
      `license_evidence_url: ${jsString(record.license_evidence_url)}`,
      `attribution_text: ${jsString(record.attribution_text)}`,
      `embedding_status: ${jsString(record.embedding_status)}`,
      `embed_url: ${jsString(record.embed_url)}`,
      `editorial_status: ${jsString(record.editorial_status)}`,
      `publication_status: ${jsString(record.publication_status)}`,
      `religious_review_status: ${jsString(record.religious_review_status)}`,
      `depiction_review_status: ${jsString(record.depiction_review_status)}`,
      `thumbnail_url: ${jsString(record.thumbnail_url)}`,
      `thumbnail_rights_status: ${jsString(record.thumbnail_rights_status)}`,
      `source_checked_at: ${jsString(record.source_checked_at)}`,
      `verification_method: ${jsString(record.verification_method)}`,
      `verification_evidence_urls: ${jsArray(record.verification_evidence_urls)}`,
      `notes: ${jsString(record.notes)}`,
      `rights_action: ${jsString(record.rights_action)}`,
      `review_reason: ${jsString(record.review_reason)}`,
      `review_next_action: ${jsString(record.review_next_action)}`,
      `provenance: { sourceFile: ${jsString(record.provenance.sourceFile)}, sourceRow: ${record.provenance.sourceRow}, inputSha256: ${jsString(record.provenance.inputSha256)} }`,
    ];
    return `{\n${fields.map((field) => `  ${field}`).join(",\n")}\n}`;
  });

  return [
    "/** GENERATED by scripts/acquire/ingest-media-catalog.ts. Do not hand-edit. */",
    "import type { MediaDiscoveryRecord } from '@/visual-golden/services/media/types';",
    "",
    "export const DISCOVERED_MEDIA_CATALOG: MediaDiscoveryRecord[] = [",
    records.map((record) => `  ${record}`).join(",\n"),
    "];",
    "",
    "export const DISCOVERED_MEDIA_COUNTS = {",
    `  total: ${data.counts.total},`,
    `  approved: ${data.counts.approved},`,
    `  pending: ${data.counts.pending},`,
    "} as const;",
    "",
  ].join("\n");
}

export function buildDiscoveryStatusModule(data: DiscoveryCatalogPayload, manifest: DiscoveryManifest): string {
  return [
    "/* Generated by scripts/acquire/ingest-media-catalog.ts. Do not hand-edit. */",
    "export const MEDIA_DISCOVERY_STATUS = {",
    `  schemaVersion: ${manifest.schemaVersion},`,
    `  generatedAt: ${JSON.stringify(manifest.generatedAt)},`,
    `  sourceCatalogSha256: ${JSON.stringify(manifest.outputs?.catalog?.sha256 ?? "")},`,
    `  totalDiscoveryRecords: ${data.counts.total},`,
    `  blockedPendingReview: ${data.counts.pending},`,
    `  approvedForPublicDisplay: ${data.counts.approved},`,
    `  rightsUnknown: ${manifest.rightsUnknown},`,
    "} as const;",
    "",
  ].join("\n");
}

export function writeDiscoveryCatalogModules(data: DiscoveryCatalogPayload, manifest: DiscoveryManifest): { catalogPath: string; catalogSource: string; statusPath: string; statusSource: string } {
  const catalogSource = buildDiscoveryCatalogModule(data);
  const statusSource = buildDiscoveryStatusModule(data, manifest);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, catalogSource, "utf-8");
  writeFileSync(STATUS_OUT, statusSource, "utf-8");
  return { catalogPath: OUT, catalogSource, statusPath: STATUS_OUT, statusSource };
}

function main() {
  const payload = JSON.parse(readFileSync(IN, "utf-8")) as DiscoveryCatalogPayload;
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf-8")) as DiscoveryManifest;
  const result = writeDiscoveryCatalogModules(payload, manifest);
  console.log(`GENERATE DISCOVERY CATALOG PASS: ${payload.counts.total} records -> ${result.catalogPath}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) main();
