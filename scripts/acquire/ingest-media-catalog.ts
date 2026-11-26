import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  buildDiscoveryCatalogModule,
  buildDiscoveryStatusModule,
  type DiscoveryCatalogPayload,
  type DiscoveryManifest,
} from "./generate-discovery-catalog";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ACQ = resolve(root, "data-sources/media/acquisition");
const OUT_DIR = resolve(root, "data-sources/media/discovery");
const CLIENT_DATA_DIR = resolve(root, "client/src/visual-golden/data");
const GENERATOR_VERSION = "media-discovery-ingest/2.0.0";

type NullableString = string | null;
type MediaRecord = {
  id: string;
  provider: string;
  video_id: NullableString;
  official_url: NullableString;
  title_original: NullableString;
  title_ar: NullableString;
  description_ar: NullableString;
  language: NullableString;
  duration_seconds: number | null;
  published_at: NullableString;
  channel_id: NullableString;
  channel_name: NullableString;
  channel_url: NullableString;
  publisher_status: NullableString;
  series_name: NullableString;
  playlist_id: NullableString;
  episode_number: number | null;
  category: NullableString;
  subcategory: NullableString;
  age_band: NullableString;
  speaker: NullableString;
  content_type: NullableString;
  rights_holder: NullableString;
  rights_notice: NullableString;
  rights_status: NullableString;
  license_type: NullableString;
  license_evidence_url: NullableString;
  attribution_text: NullableString;
  embedding_status: NullableString;
  embed_url: NullableString;
  editorial_status: NullableString;
  publication_status: NullableString;
  religious_review_status: NullableString;
  depiction_review_status: NullableString;
  thumbnail_url: NullableString;
  thumbnail_rights_status: NullableString;
  source_checked_at: NullableString;
  verification_method: NullableString;
  verification_evidence_urls: string[] | null;
  notes: NullableString;
  rights_action: NullableString;
  review_reason: NullableString;
  review_next_action: NullableString;
  provenance: {
    sourceFile: string;
    sourceRow: number;
    inputSha256: string;
  };
};

type JsonMediaRecord = Record<string, unknown> & { id: string; video_id: string | null };
type LedgerRow = Record<string, string> & { __sourceLine: number };
type PendingRow = Record<string, string> & { __sourceLine: number };
type AcquisitionManifest = {
  pack_name: string;
  generated_at: string;
  source_job: string;
  files: string[];
};

type CsvParsedRow = { fields: string[]; sourceLine: number };
type CsvRow = Record<string, string> & { __sourceLine: number };

const NUMERIC_FIELDS = new Set(["duration_seconds", "episode_number"]);
const ARRAY_FIELDS = new Set(["verification_evidence_urls"]);
const COMPARISON_FIELDS = [
  "id",
  "provider",
  "video_id",
  "official_url",
  "title_original",
  "title_ar",
  "description_ar",
  "language",
  "duration_seconds",
  "published_at",
  "channel_id",
  "channel_name",
  "channel_url",
  "publisher_status",
  "series_name",
  "playlist_id",
  "episode_number",
  "category",
  "subcategory",
  "age_band",
  "speaker",
  "content_type",
  "rights_holder",
  "rights_notice",
  "rights_status",
  "license_type",
  "license_evidence_url",
  "attribution_text",
  "embedding_status",
  "embed_url",
  "editorial_status",
  "publication_status",
  "religious_review_status",
  "depiction_review_status",
  "thumbnail_url",
  "thumbnail_rights_status",
  "source_checked_at",
  "verification_method",
  "verification_evidence_urls",
  "notes",
] as const;

export function canonicalizeText(value: string): string {
  const withoutBom = value.startsWith("\uFEFF") ? value.slice(1) : value;
  return withoutBom.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function sha256Text(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** RFC 4180-compatible parser with strict field counts and physical row lines. */
export function parseCsv(text: string, sourceLabel = "csv"): { header: string[]; rows: CsvRow[] } {
  const input = canonicalizeText(text);
  const parsedRows: CsvParsedRow[] = [];
  let fields: string[] = [];
  let field = "";
  let inQuotes = false;
  let sourceLine = 1;
  let rowStartLine = 1;

  const commitRow = () => {
    fields.push(field);
    field = "";
    if (fields.some((value) => value.length > 0)) parsedRows.push({ fields, sourceLine: rowStartLine });
    fields = [];
    rowStartLine = sourceLine + 1;
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else if (character === "\r") {
        field += "\n";
        if (input[index + 1] === "\n") index += 1;
        sourceLine += 1;
      } else {
        field += character;
        if (character === "\n") sourceLine += 1;
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0) throw new Error(`${sourceLabel}:${sourceLine}: unexpected quote inside an unquoted field`);
      inQuotes = true;
    } else if (character === ",") {
      fields.push(field);
      field = "";
    } else if (character === "\n") {
      commitRow();
      sourceLine += 1;
    } else if (character === "\r") {
      commitRow();
      if (input[index + 1] === "\n") index += 1;
      sourceLine += 1;
    } else {
      field += character;
    }
  }

  if (inQuotes) throw new Error(`${sourceLabel}:${rowStartLine}: unterminated quoted field`);
  if (field.length > 0 || fields.length > 0) commitRow();
  if (parsedRows.length === 0) throw new Error(`${sourceLabel}: missing CSV header`);

  const header = parsedRows[0].fields.map((value, index) => {
    const normalized = index === 0 ? value.replace(/^\uFEFF/, "") : value;
    if (!normalized.trim()) throw new Error(`${sourceLabel}:${parsedRows[0].sourceLine}: empty CSV header at column ${index + 1}`);
    return normalized.trim();
  });
  if (new Set(header).size !== header.length) throw new Error(`${sourceLabel}: duplicate CSV header`);

  const rows: CsvRow[] = parsedRows.slice(1).map((row) => {
    if (row.fields.length !== header.length) {
      throw new Error(`${sourceLabel}:${row.sourceLine}: expected ${header.length} fields, received ${row.fields.length}`);
    }
    const mapped: CsvRow = { __sourceLine: row.sourceLine };
    header.forEach((name, index) => {
      mapped[name] = row.fields[index];
    });
    return mapped;
  });
  return { header, rows };
}

export function readCsv(path: string): CsvRow[] {
  return parseCsv(readFileSync(path, "utf-8"), relative(root, path)).rows;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function nullable(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function coerceNumber(value: string | null): number | null {
  if (value === null || value === "" || value === "null") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname + parsed.search;
  } catch {
    return url;
  }
}

function csvComparable(field: string, value: string | undefined): string | number | string[] | null {
  if (NUMERIC_FIELDS.has(field)) return coerceNumber(nullable(value) ?? null);
  if (ARRAY_FIELDS.has(field)) {
    const normalized = nullable(value);
    return normalized ? normalized.split("|").map((item) => item.trim()).filter(Boolean) : null;
  }
  return nullable(value);
}

function jsonComparable(field: string, value: unknown): string | number | string[] | null {
  if (NUMERIC_FIELDS.has(field)) return typeof value === "number" && Number.isFinite(value) ? value : null;
  if (ARRAY_FIELDS.has(field)) {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : null;
  }
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? nullable(value) : String(value);
}

function sameComparable(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sortedCounts(records: MediaRecord[], field: "category" | "publication_status" | "rights_status"): Record<string, number> {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = record[field] ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function deterministicGeneratedAt(acquisitionManifest: AcquisitionManifest): string {
  const epoch = process.env.SOURCE_DATE_EPOCH;
  if (epoch !== undefined) {
    const seconds = Number(epoch);
    if (!Number.isFinite(seconds) || seconds < 0) throw new Error("SOURCE_DATE_EPOCH must be a non-negative number of seconds");
    return new Date(seconds * 1000).toISOString();
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(acquisitionManifest.generated_at)) {
    throw new Error(`Invalid acquisition manifest generated_at: ${acquisitionManifest.generated_at}`);
  }
  return `${acquisitionManifest.generated_at}T00:00:00.000Z`;
}

function inputDescriptor(path: string): { path: string; sha256: string; bytes: number; hashMode: "utf8-lf" } {
  const canonical = canonicalizeText(readFileSync(path, "utf-8"));
  return {
    path: relative(root, path).replace(/\\/g, "/"),
    sha256: sha256Text(canonical),
    bytes: Buffer.byteLength(canonical, "utf8"),
    hashMode: "utf8-lf",
  };
}

function isPubliclyApproved(record: MediaRecord): boolean {
  return (
    record.publication_status === "APPROVED" &&
    ["CLEARED", "GRANTED"].includes(record.rights_status ?? "") &&
    record.editorial_status === "APPROVED" &&
    ["VERIFIED", "ALLOWED"].includes(record.embedding_status ?? "") &&
    record.religious_review_status === "APPROVED" &&
    record.depiction_review_status === "APPROVED"
  );
}

export function buildDiscoveryArtifacts() {
  const errors: string[] = [];
  const warnings: string[] = [];
  const acquisitionManifestPath = resolve(ACQ, "media-acquisition-manifest.json");
  const kidsCsvPath = resolve(ACQ, "kids-media-catalog.csv");
  const kidsJsonPath = resolve(ACQ, "kids-media-catalog.json");
  const seerahCsvPath = resolve(ACQ, "seerah-media-catalog.csv");
  const seerahJsonPath = resolve(ACQ, "seerah-media-catalog.json");
  const ledgerPath = resolve(ACQ, "media-rights-ledger.csv");
  const pendingPath = resolve(ACQ, "media-rejected-and-pending.csv");

  const acquisitionManifest = readJson<AcquisitionManifest>(acquisitionManifestPath);
  const kidsCsv = readCsv(kidsCsvPath);
  const seerahCsv = readCsv(seerahCsvPath);
  const ledgerRows = readCsv(ledgerPath) as LedgerRow[];
  const pendingRows = readCsv(pendingPath) as PendingRow[];
  const kidsJson = readJson<{ records: JsonMediaRecord[] }>(kidsJsonPath);
  const seerahJson = readJson<{ records: JsonMediaRecord[] }>(seerahJsonPath);

  if (kidsJson.records.length !== kidsCsv.length) errors.push(`kids: JSON count ${kidsJson.records.length} != CSV count ${kidsCsv.length}`);
  if (seerahJson.records.length !== seerahCsv.length) errors.push(`seerah: JSON count ${seerahJson.records.length} != CSV count ${seerahCsv.length}`);

  const csvSources = [
    { file: "kids-media-catalog.csv", path: kidsCsvPath, rows: kidsCsv },
    { file: "seerah-media-catalog.csv", path: seerahCsvPath, rows: seerahCsv },
  ];
  const inputHashes = new Map(csvSources.map((source) => [source.file, inputDescriptor(source.path).sha256]));

  const jsonByVideoId = new Map<string, JsonMediaRecord>();
  for (const record of [...kidsJson.records, ...seerahJson.records]) {
    if (!record.video_id) {
      errors.push(`JSON record ${record.id} is missing video_id`);
      continue;
    }
    if (jsonByVideoId.has(record.video_id)) {
      errors.push(`JSON duplicate video_id: ${record.video_id}`);
      continue;
    }
    jsonByVideoId.set(record.video_id, record);
  }

  const ledgerByVideoId = new Map<string, LedgerRow>();
  for (const row of ledgerRows) {
    if (ledgerByVideoId.has(row.video_id)) errors.push(`rights ledger duplicate video_id: ${row.video_id}`);
    else ledgerByVideoId.set(row.video_id, row);
  }
  const pendingByVideoId = new Map<string, PendingRow>();
  for (const row of pendingRows) {
    if (pendingByVideoId.has(row.video_id)) errors.push(`pending ledger duplicate video_id: ${row.video_id}`);
    else pendingByVideoId.set(row.video_id, row);
  }

  const records: MediaRecord[] = [];
  const seen = new Set<string>();
  const seenUrl = new Set<string>();
  let duplicatesSkipped = 0;

  for (const source of csvSources) {
    for (const raw of source.rows) {
      const sourceLine = raw.__sourceLine;
      const videoId = nullable(raw.video_id);
      const officialUrl = nullable(raw.official_url);
      if (!videoId) {
        errors.push(`${source.file}:${sourceLine}: missing video_id`);
        continue;
      }
      const dedupeKey = `${nullable(raw.provider) ?? "youtube"}|${videoId}`;
      const canonicalUrl = normalizeUrl(officialUrl);
      if (seen.has(dedupeKey)) {
        duplicatesSkipped += 1;
        warnings.push(`${source.file}:${sourceLine}: duplicate (provider,video_id) ${dedupeKey} — skipped`);
        continue;
      }
      if (canonicalUrl && seenUrl.has(canonicalUrl)) {
        duplicatesSkipped += 1;
        warnings.push(`${source.file}:${sourceLine}: duplicate canonical URL ${canonicalUrl} — skipped`);
        continue;
      }
      seen.add(dedupeKey);
      if (canonicalUrl) seenUrl.add(canonicalUrl);

      const jsonMatch = jsonByVideoId.get(videoId);
      const ledgerMatch = ledgerByVideoId.get(videoId);
      const pendingMatch = pendingByVideoId.get(videoId);
      if (!jsonMatch) errors.push(`${source.file}:${sourceLine}: no JSON cross-check record for ${videoId}`);
      if (!ledgerMatch) errors.push(`${source.file}:${sourceLine}: no rights-ledger record for ${videoId}`);
      if (!pendingMatch) errors.push(`${source.file}:${sourceLine}: no pending-review record for ${videoId}`);

      if (jsonMatch) {
        for (const field of COMPARISON_FIELDS) {
          const csvValue = csvComparable(field, raw[field]);
          const jsonValue = jsonComparable(field, jsonMatch[field]);
          if (!sameComparable(csvValue, jsonValue)) {
            errors.push(`${source.file}:${sourceLine}: ${field} CSV/JSON mismatch for ${videoId}`);
          }
        }
      }

      records.push({
        id: nullable(raw.id) ?? `youtube:${videoId}`,
        provider: nullable(raw.provider) ?? "youtube",
        video_id: videoId,
        official_url: officialUrl,
        title_original: nullable(raw.title_original),
        title_ar: nullable(raw.title_ar),
        description_ar: nullable(raw.description_ar),
        language: nullable(raw.language),
        duration_seconds: coerceNumber(nullable(raw.duration_seconds)),
        published_at: nullable(raw.published_at),
        channel_id: nullable(raw.channel_id),
        channel_name: nullable(raw.channel_name),
        channel_url: nullable(raw.channel_url),
        publisher_status: nullable(ledgerMatch?.publisher_status) ?? nullable(raw.publisher_status),
        series_name: nullable(raw.series_name),
        playlist_id: nullable(raw.playlist_id),
        episode_number: coerceNumber(nullable(raw.episode_number)),
        category: nullable(raw.category),
        subcategory: nullable(raw.subcategory),
        age_band: nullable(raw.age_band),
        speaker: nullable(raw.speaker),
        content_type: nullable(raw.content_type),
        rights_holder: nullable(raw.rights_holder),
        rights_notice: nullable(raw.rights_notice),
        rights_status: nullable(ledgerMatch?.rights_status) ?? nullable(raw.rights_status) ?? "UNKNOWN",
        license_type: nullable(ledgerMatch?.license_type) ?? nullable(raw.license_type),
        license_evidence_url: nullable(ledgerMatch?.license_evidence_url) ?? nullable(raw.license_evidence_url),
        attribution_text: nullable(ledgerMatch?.attribution_text) ?? nullable(raw.attribution_text),
        embedding_status: nullable(ledgerMatch?.embedding_status) ?? nullable(raw.embedding_status) ?? "UNTESTED",
        embed_url: nullable(raw.embed_url),
        editorial_status: nullable(ledgerMatch?.editorial_status) ?? nullable(raw.editorial_status) ?? "PENDING_REVIEW",
        publication_status: nullable(ledgerMatch?.publication_status) ?? nullable(raw.publication_status) ?? "DRAFT",
        religious_review_status: nullable(raw.religious_review_status) ?? "PENDING_REVIEW",
        depiction_review_status: nullable(raw.depiction_review_status) ?? "PENDING_REVIEW",
        thumbnail_url: nullable(raw.thumbnail_url),
        thumbnail_rights_status: nullable(raw.thumbnail_rights_status) ?? "UNKNOWN",
        source_checked_at: nullable(raw.source_checked_at),
        verification_method: nullable(raw.verification_method),
        verification_evidence_urls: nullable(raw.verification_evidence_urls)
          ? raw.verification_evidence_urls.split("|").map((url) => url.trim()).filter(Boolean)
          : null,
        notes: nullable(raw.notes),
        rights_action: nullable(ledgerMatch?.rights_action),
        review_reason: nullable(pendingMatch?.reason),
        review_next_action: nullable(pendingMatch?.next_action),
        provenance: {
          sourceFile: source.file,
          sourceRow: sourceLine,
          inputSha256: inputHashes.get(source.file) ?? "",
        },
      });
    }
  }

  for (const videoId of jsonByVideoId.keys()) {
    if (!seen.has(`youtube|${videoId}`) && ![...seen].some((key) => key.endsWith(`|${videoId}`))) {
      errors.push(`JSON record ${videoId} was not matched to a CSV source row`);
    }
  }
  for (const videoId of ledgerByVideoId.keys()) {
    if (![...seen].some((key) => key.endsWith(`|${videoId}`))) errors.push(`rights-ledger record ${videoId} has no catalog row`);
  }
  for (const videoId of pendingByVideoId.keys()) {
    if (![...seen].some((key) => key.endsWith(`|${videoId}`))) errors.push(`pending-review record ${videoId} has no catalog row`);
  }

  records.sort((left, right) => left.id.localeCompare(right.id));
  const approvedForPublicDisplay = records.filter(isPubliclyApproved).length;
  const blockedPendingReview = records.length - approvedForPublicDisplay;
  const rightsUnknown = records.filter((record) => record.rights_status === "UNKNOWN").length;
  const generatedAt = deterministicGeneratedAt(acquisitionManifest);

  const catalog: DiscoveryCatalogPayload = {
    schemaVersion: 2,
    generatedAt,
    policy: "Governed discovery ingestion. No record is promoted to APPROVED. Adult provider candidates may use the source player while review remains pending; UNTESTED never means runtime-verified or rights-cleared.",
    counts: {
      total: records.length,
      approved: approvedForPublicDisplay,
      pending: blockedPendingReview,
    },
    records,
  };

  const catalogText = `${JSON.stringify(catalog, null, 2)}\n`;
  const catalogHash = sha256Text(catalogText);
  const provisionalManifest: DiscoveryManifest = {
    schemaVersion: 2,
    generatedAt,
    sourcePack: acquisitionManifest.pack_name,
    totalUniqueRecords: records.length,
    approvedForPublicDisplay,
    blockedPendingReview,
    rightsUnknown,
    outputs: {
      catalog: {
        path: "data-sources/media/discovery/media-discovery-catalog.json",
        sha256: catalogHash,
        bytes: Buffer.byteLength(catalogText, "utf8"),
      },
    },
  };
  const clientCatalogSource = buildDiscoveryCatalogModule(catalog);
  const clientStatusSource = buildDiscoveryStatusModule(catalog, provisionalManifest);

  const consumedInputPaths = [
    acquisitionManifestPath,
    kidsCsvPath,
    kidsJsonPath,
    seerahCsvPath,
    seerahJsonPath,
    ledgerPath,
    pendingPath,
  ];
  const inputs = consumedInputPaths.map(inputDescriptor);
  const declaredFilesMissing = acquisitionManifest.files.filter((file) => {
    try {
      readFileSync(resolve(ACQ, file));
      return false;
    } catch {
      return true;
    }
  });
  for (const file of declaredFilesMissing) warnings.push(`acquisition manifest declares a file that is not present in this checkout: ${file}`);

  const manifest = {
    schemaVersion: 2,
    generator: GENERATOR_VERSION,
    generatedAt,
    sourcePack: acquisitionManifest.pack_name,
    sourceJob: acquisitionManifest.source_job,
    sourceFiles: csvSources.map((source) => source.file),
    inputs,
    totalUniqueRecords: records.length,
    duplicatesSkipped,
    byCategory: sortedCounts(records, "category"),
    byPublicationStatus: sortedCounts(records, "publication_status"),
    byRightsStatus: sortedCounts(records, "rights_status"),
    approvedForPublicDisplay,
    blockedPendingReview,
    rightsUnknown,
    declaredFilesMissing,
    outputs: {
      catalog: {
        path: "data-sources/media/discovery/media-discovery-catalog.json",
        sha256: catalogHash,
        bytes: Buffer.byteLength(catalogText, "utf8"),
      },
      clientCatalog: {
        path: "client/src/visual-golden/data/media-discovery.generated.ts",
        sha256: sha256Text(clientCatalogSource),
        bytes: Buffer.byteLength(clientCatalogSource, "utf8"),
      },
      clientStatus: {
        path: "client/src/visual-golden/data/media-discovery-status.generated.ts",
        sha256: sha256Text(clientStatusSource),
        bytes: Buffer.byteLength(clientStatusSource, "utf8"),
      },
    },
    policy: catalog.policy,
  } satisfies DiscoveryManifest & Record<string, unknown>;

  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  const manifestHash = sha256Text(manifestText);
  const reportText = [
    "# تقرير الاستيراد (Ingestion Report)",
    "",
    `تاريخ الإنشاء الثابت: ${generatedAt}`,
    `مولّد البيانات: ${GENERATOR_VERSION}`,
    `عدد السجلات الفريدة المستوردة: ${records.length}`,
    `تم تخطي المكررات: ${duplicatesSkipped}`,
    `المؤهلة للعرض العام (APPROVED): ${approvedForPublicDisplay}`,
    `غير مكتملة الاعتماد الكامل (PENDING/DRAFT): ${blockedPendingReview}`,
    `بحقوق UNKNOWN: ${rightsUnknown}`,
    "",
    "## بصمات المدخلات",
    ...inputs.map((input) => `- ${input.path}: ${input.sha256} (${input.bytes} bytes, ${input.hashMode})`),
    "",
    "## بصمات المخرجات",
    `- media-discovery-catalog.json: ${catalogHash}`,
    `- ingestion-manifest.json: ${manifestHash}`,
    `- media-discovery.generated.ts: ${manifest.outputs.clientCatalog.sha256}`,
    `- media-discovery-status.generated.ts: ${manifest.outputs.clientStatus.sha256}`,
    "",
    "## حسب الفئة",
    ...Object.entries(manifest.byCategory).map(([category, count]) => `- ${category}: ${count}`),
    "",
    "## حسب حالة النشر",
    ...Object.entries(manifest.byPublicationStatus).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## حسب حالة الحقوق",
    ...Object.entries(manifest.byRightsStatus).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## السياسة",
    "- لا يوجد سجل تمت ترقيته إلى APPROVED.",
    "- جميع السجلات بقيمة DRAFT / PENDING_REVIEW remain في طبقة discovery غير العامة.",
    "- حقل embed_url مرشح لمشغل المصدر للبالغين فقط؛ UNTESTED لا يعني أن التشغيل تحقق فعليًا ولا أن الحقوق أو المراجعة اكتملت.",
    "",
    "## تحذيرات",
    ...(warnings.length > 0 ? warnings : ["لا توجد تحذيرات."]),
    ...(errors.length > 0 ? ["## أخطاء", ...errors] : []),
  ].join("\n");

  if (errors.length > 0) {
    return { errors, warnings, manifestText, catalogText, reportText, clientCatalogSource, clientStatusSource };
  }

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(CLIENT_DATA_DIR, { recursive: true });
  writeFileSync(resolve(OUT_DIR, "media-discovery-catalog.json"), catalogText, "utf-8");
  writeFileSync(resolve(OUT_DIR, "ingestion-manifest.json"), manifestText, "utf-8");
  writeFileSync(resolve(OUT_DIR, "ingestion-report.md"), `${reportText}\n`, "utf-8");
  writeFileSync(resolve(CLIENT_DATA_DIR, "media-discovery.generated.ts"), clientCatalogSource, "utf-8");
  writeFileSync(resolve(CLIENT_DATA_DIR, "media-discovery-status.generated.ts"), clientStatusSource, "utf-8");

  return {
    errors,
    warnings,
    manifest,
    manifestHash,
    catalogHash,
    total: records.length,
    approved: approvedForPublicDisplay,
    pending: blockedPendingReview,
    rightsUnknown,
    outputPath: resolve(OUT_DIR, "media-discovery-catalog.json"),
  };
}

function main() {
  const result = buildDiscoveryArtifacts();
  if (result.errors.length > 0) {
    console.error("INGESTION FAILED:");
    for (const error of result.errors) console.error(` - ${error}`);
    process.exit(1);
  }

  console.log("INGESTION PASS:");
  console.log(` - total unique records: ${result.total}`);
  console.log(` - duplicates skipped: ${result.manifest?.duplicatesSkipped ?? 0}`);
  console.log(` - approved for public display: ${result.approved}`);
  console.log(` - not fully approved: ${result.pending}`);
  console.log(` - catalog sha256: ${result.catalogHash}`);
  console.log(` - manifest sha256: ${result.manifestHash}`);
  console.log(` - output: ${result.outputPath}`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) main();
